import { deserializeDatum, mConStr, mConStr0, mConStr1, mConStr2, mPubKeyAddress } from "@meshsdk/core";
import { alwaysSuccessMintValidatorHash, blockchainProvider, depositScriptTxHash, depositScriptTxIdx, invalidAfter, invalidBefore, MarketCreatorNft, MinMarketLovelace, PrecisionFactor, txBuilder, UsdmAssetName, UsdmUnit, wallet1, wallet1Address, wallet1Collateral, wallet1SK, wallet1Utxos, wallet1VK, YesTokenName } from "../setup.js";
import { MarketAddr, MarketHash, MarketValidatorScript } from "./validator.js";
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

const marketUtxos = await blockchainProvider.fetchAddressUTxOs(DepositAddr);
const marketUtxo = marketUtxos[marketUtxos.length - 1];

const marketPlutusData = marketUtxo.output.plutusData!;
const marketDatum = deserializeDatum<MarketDatumType>(marketPlutusData);

const yesAmount = 100;

const winnerField = marketDatum.fields[11];
let winnerShare = null;

if (Number(winnerField.constructor) === 0) {
 winnerShare = Number(winnerField.fields[0].constructor);
}
// if `winnerShare` turns out to be 0, Yes is the winning side, else No won
if (winnerShare !== 0) throw new Error("Yes didn't win!");

const q = Number(marketDatum.fields[6].int);
const qYes = Number(marketDatum.fields[7].int);
const pYes = Number(marketDatum.fields[9].int);
const qNo = Number(marketDatum.fields[8].int);
const pNo = Number(marketDatum.fields[10].int);

const ExistingMarketDatum = mConStr0([
  mPubKeyAddress(marketDatum.fields[0].fields[0].fields[0].bytes, marketDatum.fields[0].fields[1].fields[0]?.fields[0].fields[0].bytes),//mPubKeyAddress(wallet1VK, wallet1SK),
  marketDatum.fields[1].bytes,
  marketToken,
  Number(marketDatum.fields[3].int),
  mConStr0([Number(marketDatum.fields[4].fields[0].int), Number(marketDatum.fields[4].fields[1].int)]),
  mConStr0([Number(marketDatum.fields[5].fields[0].int), Number(marketDatum.fields[5].fields[1].int)]),
  q,
  qYes,
  qNo,
  pYes,
  pNo,
  mConStr0([mConStr0([])]),
]);

// YesMarketBuy
const MarketExecution = mConStr(6, [yesAmount, mPubKeyAddress(wallet1VK, wallet1SK)]);

const marketUsdm = marketUtxo.output.amount.find(amt => amt.unit === UsdmUnit);
if (!marketUsdm) throw new Error("No usdm in market");
const userReduceValue = yesAmount * multiplier;
const UpdatedMarketUsdmQuantity = Number(marketUsdm.quantity) - userReduceValue;

const rMem = 1500000;
const rSteps = 1000000000;

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
    // .txInRedeemerValue(MarketExecution, "Mesh", { mem: rMem, steps: rSteps })
    // mint "Yes" tokens
    .mintPlutusScriptV3()
    .mint(String(-yesAmount), MarketHash, YesTokenName)
    .mintingScript(MarketValidatorScript)
    .mintRedeemerValue(MarketExecution)
    // .mintRedeemerValue(MarketExecution, "Mesh", { mem: rMem, steps: rSteps })
    // send back market utxo
    .txOut(DepositAddr, [
      { unit: "lovelace", quantity: MinMarketLovelace },
      { unit: MarketHash + MarketCreatorNft, quantity: "1" },
      { unit: UsdmUnit, quantity: String(UpdatedMarketUsdmQuantity) }
    ])
    .txOutInlineDatumValue(ExistingMarketDatum)
    // send user USDM
    .txOut(wallet1Address, [{ unit: UsdmUnit, quantity: String(userReduceValue) }])
    .requiredSignerHash(wallet1VK)
    .txInCollateral(
        wallet1Collateral.input.txHash,
        wallet1Collateral.input.outputIndex,
        wallet1Collateral.output.amount,
        wallet1Collateral.output.address,
    )
    .invalidBefore(invalidBefore)
    .invalidHereafter(invalidAfter)
    .changeAddress(wallet1Address)
    .changeAddress(wallet1Address)
    .selectUtxosFrom(wallet1Utxos)
    .complete()

const signedTx = await wallet1.signTx(unsignedTx);

const txHash = await wallet1.submitTx(signedTx);
console.log("Yes market redeem tx hash:", txHash);
