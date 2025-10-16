import { deserializeDatum, IWallet, mConStr, mConStr0, mConStr1, MeshTxBuilder, mPubKeyAddress, UTxO } from "@meshsdk/core";
import { DepositAddr, DepositHash } from "../deposit/validator";
import { BlockchainProviderType, MarketDatumType } from "../types";
import { setup } from "../setup";
import { getMarketUtxo } from "../utils";

export const NoMarketSell = async (
    txBuilder: MeshTxBuilder,
    blockchainProvider: BlockchainProviderType,
    wallet: IWallet,
    walletAddress: string,
    walletCollateral: UTxO,
    walletUtxos: UTxO[],
    walletVK: string,
    walletSK: string,
    noAmount: number,
    MarketHash: string,
    MarketValidatorScript: string,
) => {
  const { depositScriptTxHash, depositScriptTxIdx, MarketCreatorNft, NoTokenName, PrecisionFactor, UsdmUnit, multiplier, marketToken } = setup();

  const marketUtxo = await getMarketUtxo(blockchainProvider, MarketHash);

  const marketDatum = deserializeDatum<MarketDatumType>(marketUtxo.output.plutusData!);
  console.log("marketDatum:", marketDatum, '\n');
  console.log("marketDatum 4:", marketDatum.fields[4].fields[0].int);
  console.log("marketDatum 4:", marketDatum.fields[4].fields[1].int);

  const q = Number(marketDatum.fields[6].int);
  const qNo = Number(marketDatum.fields[8].int);
  const pNo = Number(marketDatum.fields[10].int);
  const qYes = Number(marketDatum.fields[7].int);

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

  // NoMarketSell
  const MarketExecution = mConStr(5, [noAmount, mPubKeyAddress(walletVK, walletSK)]);

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
