import { deserializeDatum, IWallet, mConStr, mConStr0, mConStr1, MeshTxBuilder, mPubKeyAddress, UTxO } from "@meshsdk/core";
import { DepositAddr, DepositHash } from "../deposit/validator";
import { BlockchainProviderType, MarketDatumType } from "../types";
import { setup } from "../setup";
import { getMarketUtxo } from "../utils";

export const YesMarketSell = async (
    txBuilder: MeshTxBuilder,
    blockchainProvider: BlockchainProviderType,
    wallet: IWallet,
    walletAddress: string,
    walletCollateral: UTxO,
    walletUtxos: UTxO[],
    walletVK: string,
    walletSK: string,
    yesAmount: number,
    MarketHash: string,
    MarketValidatorScript: string,
) => {
  const { depositScriptTxHash, depositScriptTxIdx, MarketCreatorNft, YesTokenName, PrecisionFactor, UsdmUnit, multiplier, marketToken } = setup();

  const marketUtxo = await getMarketUtxo(blockchainProvider, MarketHash);

  const marketDatum = deserializeDatum<MarketDatumType>(marketUtxo.output.plutusData!);
  console.log("marketDatum:", marketDatum, '\n');
  console.log("marketDatum 4:", marketDatum.fields[4].fields[0].int);
  console.log("marketDatum 4:", marketDatum.fields[4].fields[1].int);

  const q = Number(marketDatum.fields[6].int);
  const qYes = Number(marketDatum.fields[7].int);
  const pYes = Number(marketDatum.fields[9].int);
  const qNo = Number(marketDatum.fields[8].int);

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

  // YesMarketSell
  const MarketExecution = mConStr(4, [yesAmount, mPubKeyAddress(walletVK, walletSK)]);

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
      .txOut(walletAddress, [{ unit: UsdmUnit, quantity: String(userReduceValue) }])
      .requiredSignerHash(walletVK)
      .txInCollateral(
          walletCollateral.input.txHash,
          walletCollateral.input.outputIndex,
          walletCollateral.output.amount,
          walletCollateral.output.address,
      )
      .changeAddress(walletAddress)
      .selectUtxosFrom(walletUtxos)
      .complete()

  const signedTx = await wallet.signTx(unsignedTx, true);
  const txHash = await wallet.submitTx(signedTx);

  txBuilder.reset();

  return txHash;
}
