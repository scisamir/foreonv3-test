import { deserializeDatum, mConStr, mConStr0, mConStr1, mConStr2, mPubKeyAddress } from "@meshsdk/core";
import { alwaysSuccessMintValidatorHash, blockchainProvider, depositScriptTxHash, depositScriptTxIdx, MarketCreatorNft, PrecisionFactor, txBuilder, UsdmAssetName, UsdmUnit, wallet1, wallet1Address, wallet1Collateral, wallet1SK, wallet1Utxos, wallet1VK, YesTokenName } from "../setup.js";
import { MarketHash, MarketValidatorScript } from "./validator.js";
import { DepositAddr, DepositHash } from "../deposit/validator.js";
import { MarketDatumType } from "../types.js";

const multiplier = 1_000_000;
const marketToken =
  mConStr0([
    mConStr1([]),
    alwaysSuccessMintValidatorHash,
    UsdmAssetName,
    multiplier,
  ]);

const marketUtxo = (await blockchainProvider.fetchAddressUTxOs(DepositAddr))[0];

const marketDatum = deserializeDatum<MarketDatumType>(marketUtxo.output.plutusData!);
console.log("marketDatum:", marketDatum, '\n');
console.log("marketDatum 4:", marketDatum.fields[4].fields[0].int);
console.log("marketDatum 4:", marketDatum.fields[4].fields[1].int);

const q = Number(marketDatum.fields[6].int);
const qYes = Number(marketDatum.fields[7].int);
const pYes = Number(marketDatum.fields[9].int);
const qNo = Number(marketDatum.fields[8].int);

const yesAmount = 100;

const newQ = q - yesAmount;
const newQYes = qYes - yesAmount;
const newPYes = Math.floor((newQYes * PrecisionFactor) / newQ);
const newPNo = Math.floor((qNo * PrecisionFactor) / newQ);

console.log("newQ:", newQ);
console.log("newQYes:", newQYes);
console.log("newPYes:", newPYes);

const userReduceValue = (pYes * yesAmount * multiplier) / PrecisionFactor;

const UpdatedMarketDatum = mConStr0([
  mPubKeyAddress(marketDatum.fields[0].fields[0].fields[0].bytes, marketDatum.fields[0].fields[1].fields[0]?.fields[0].fields[0].bytes),//mPubKeyAddress(wallet1VK, wallet1SK),
  marketDatum.fields[1].bytes,
  marketToken,
  Number(marketDatum.fields[3].int),
  mConStr0([Number(marketDatum.fields[4].fields[0].int), Number(marketDatum.fields[4].fields[1].int)]),
  mConStr0([Number(marketDatum.fields[5].fields[0].int), Number(marketDatum.fields[5].fields[1].int)]),
  newQ,
  newQYes,
  qNo,
  newPYes,
  newPNo,
  mConStr1([]),
]);

// YesMarketBuy
const MarketExecution = mConStr(4, [yesAmount, mPubKeyAddress(wallet1VK, wallet1SK)]);

const tokenUnit = MarketHash + YesTokenName;

const marketUsdm = marketUtxo.output.amount.find(amt => amt.unit === UsdmUnit);
if (!marketUsdm) throw new Error("No usdm in market");
const UpdatedMarketUsdmQuantity = Number(marketUsdm.quantity) - userReduceValue;

const unsignedTx = await txBuilder
    // spend market utxo
    .spendingPlutusScriptV3()
    .txIn(
        marketUtxo.input.txHash,
        marketUtxo.input.outputIndex,
        marketUtxo.output.amount,
        marketUtxo.output.address,
    )
    .spendingTxInReference(depositScriptTxHash, depositScriptTxIdx, undefined, DepositHash)
    .txInInlineDatumPresent()
    .txInRedeemerValue(MarketExecution)
    // mint "Yes" tokens
    .mintPlutusScriptV3()
    .mint("-" + String(yesAmount), MarketHash, YesTokenName)
    .mintingScript(MarketValidatorScript)
    .mintRedeemerValue(MarketExecution)
    // send back market utxo
    .txOut(DepositAddr, [
      { unit: MarketHash + MarketCreatorNft, quantity: "1" },
      { unit: UsdmUnit, quantity: String(UpdatedMarketUsdmQuantity) }
    ])
    .txOutInlineDatumValue(UpdatedMarketDatum)
    // send user "Yes" tokens
    .txOut(wallet1Address, [{ unit: UsdmUnit, quantity: String(userReduceValue) }])
    .requiredSignerHash(wallet1VK)
    .txInCollateral(
        wallet1Collateral.input.txHash,
        wallet1Collateral.input.outputIndex,
        wallet1Collateral.output.amount,
        wallet1Collateral.output.address,
    )
    .changeAddress(wallet1Address)
    .selectUtxosFrom(wallet1Utxos)
    .complete()

const signedTx = await wallet1.signTx(unsignedTx);

const txHash = await wallet1.submitTx(signedTx);
console.log("Yes market sell tx hash:", txHash);
