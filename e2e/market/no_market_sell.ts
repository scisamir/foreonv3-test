import { deserializeDatum, mConStr, mConStr0, mConStr1, mConStr2, mConStr3, mPubKeyAddress } from "@meshsdk/core";
import { alwaysSuccessMintValidatorHash, blockchainProvider, depositScriptTxHash, depositScriptTxIdx, MarketCreatorNft, NoTokenName, PrecisionFactor, txBuilder, UsdmAssetName, UsdmUnit, wallet1, wallet1Address, wallet1Collateral, wallet1SK, wallet1Utxos, wallet1VK } from "../setup.js";
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
const qNo = Number(marketDatum.fields[8].int);
const pNo = Number(marketDatum.fields[10].int);
const qYes = Number(marketDatum.fields[7].int);

const noAmount = 100;

const newQ = q - noAmount;
const newQNo = qNo - noAmount;
const newPNo = Math.floor((newQNo * PrecisionFactor) / newQ);
const newPYes = Math.floor((qYes * PrecisionFactor) / newQ);

console.log("newQ:", newQ);
console.log("newQNo:", newQNo);
console.log("newPNo:", newPNo);

const userReduceValue = (pNo * noAmount * multiplier) / PrecisionFactor;

const UpdatedMarketDatum = mConStr0([
  mPubKeyAddress(marketDatum.fields[0].fields[0].fields[0].bytes, marketDatum.fields[0].fields[1].fields[0]?.fields[0].fields[0].bytes),//mPubKeyAddress(wallet1VK, wallet1SK),
  marketDatum.fields[1].bytes,
  marketToken,
  Number(marketDatum.fields[3].int),
  mConStr0([Number(marketDatum.fields[4].fields[0].int), Number(marketDatum.fields[4].fields[1].int)]),
  mConStr0([Number(marketDatum.fields[5].fields[0].int), Number(marketDatum.fields[5].fields[1].int)]),
  newQ,
  qYes,
  newQNo,
  newPYes,
  newPNo,
  mConStr1([]),
]);

// NoMarketBuy
const MarketExecution = mConStr(5, [noAmount, mPubKeyAddress(wallet1VK, wallet1SK)]);

const tokenUnit = MarketHash + NoTokenName;

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
    // mint "No" tokens
    .mintPlutusScriptV3()
    .mint("-" + String(noAmount), MarketHash, NoTokenName)
    .mintingScript(MarketValidatorScript)
    .mintRedeemerValue(MarketExecution)
    // send back market utxo
    .txOut(DepositAddr, [
      { unit: MarketHash + MarketCreatorNft, quantity: "1" },
      { unit: UsdmUnit, quantity: String(UpdatedMarketUsdmQuantity) }
    ])
    .txOutInlineDatumValue(UpdatedMarketDatum)
    // send user "No" tokens
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
console.log("No market sell tx hash:", txHash);
