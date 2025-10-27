import { deserializeDatum, mConStr, mConStr0, mConStr1, mPubKeyAddress } from "@meshsdk/core";
import { alwaysSuccessMintValidatorHash, blockchainProvider, depositScriptTxHash, depositScriptTxIdx, multiSigAddress, multiSigCbor, multiSigUtxos, txBuilder, UsdmAssetName, UsdmUnit, wallet1, wallet1Address, wallet1Collateral, wallet1Utxos, wallet2 } from "../setup.js";
import { DepositAddr, DepositHash } from "../deposit/validator.js";
import { MarketDatumType } from "../types.js";
import { GlobalSettingsAddr } from "./validator.js";

const multiplier = 1_000_000;
const marketToken =
  mConStr0([
    mConStr1([]),
    alwaysSuccessMintValidatorHash,
    UsdmAssetName,
    multiplier,
  ]);

if (!multiSigCbor) {
    throw new Error("multisig cbor doesn't exist");
}

const marketUtxos = await blockchainProvider.fetchAddressUTxOs(DepositAddr);
const marketUtxo = marketUtxos[marketUtxos.length - 1];

const marketDatum = deserializeDatum<MarketDatumType>(marketUtxo.output.plutusData!);

const q = Number(marketDatum.fields[6].int);
const qYes = Number(marketDatum.fields[7].int);
const qNo = Number(marketDatum.fields[8].int);
const pYes = Number(marketDatum.fields[9].int);
const pNo = Number(marketDatum.fields[10].int);

const getWinner = (shareType: "Yes" | "No") => {
  return shareType === "Yes"
    ? mConStr0([mConStr0([])])
    : mConStr0([mConStr1([])])
}

let winner = getWinner("No");

const UpdatedMarketDatum = mConStr0([
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
  winner,
]);

const marketUsdm = marketUtxo.output.amount.find(amt => amt.unit === UsdmUnit);
if (!marketUsdm) throw new Error("No usdm in market");

const gsRef = (await blockchainProvider.fetchAddressUTxOs(GlobalSettingsAddr))[0];

console.log("marketUtxo:", marketUtxo.output.amount);

const unsignedTx = await txBuilder
    // signing utxo
    .txIn(
        multiSigUtxos[0].input.txHash,
        multiSigUtxos[0].input.outputIndex,
        multiSigUtxos[0].output.amount,
        multiSigUtxos[0].output.address,
    )
    .txInScript(multiSigCbor)
    // deposit/market utxo
    .spendingPlutusScriptV3()
    .txIn(
        marketUtxo.input.txHash,
        marketUtxo.input.outputIndex,
        marketUtxo.output.amount,
        marketUtxo.output.address,
    )
    .spendingTxInReference(depositScriptTxHash, depositScriptTxIdx, undefined, DepositHash)
    .txInInlineDatumPresent()
    .txInRedeemerValue(mConStr(7, []))
    // send back market utxo
    .txOut(DepositAddr, marketUtxo.output.amount)
    .txOutInlineDatumValue(UpdatedMarketDatum)
    // send back multisig value to multisig
    .txOut(multiSigAddress, multiSigUtxos[0].output.amount)
    .readOnlyTxInReference(gsRef.input.txHash, gsRef.input.outputIndex)
    .txInCollateral(
        wallet1Collateral.input.txHash,
        wallet1Collateral.input.outputIndex,
        wallet1Collateral.output.amount,
        wallet1Collateral.output.address,
    )
    .changeAddress(wallet1Address)
    .selectUtxosFrom(wallet1Utxos)
    // .setFee("2242070")
    .complete()

const signedTx1 = await wallet1.signTx(unsignedTx);
const signedTx2 = await wallet2.signTx(signedTx1, true);

const txHash = await wallet1.submitTx(signedTx2);
console.log("Update winner tx hash:", txHash);
