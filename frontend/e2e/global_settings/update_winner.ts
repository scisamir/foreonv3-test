import { deserializeDatum, IWallet, mConStr, mConStr0, mConStr1, MeshTxBuilder, mPubKeyAddress, UTxO } from "@meshsdk/core";
import { DepositAddr, DepositHash } from "../deposit/validator";
import { BlockchainProviderType, MarketDatumType } from "../types";
import { GlobalSettingsAddr } from "./validator";
import { setup } from "../setup";
import { getMarketUtxo } from "../utils";
import { Market, MarketUWLSItem, SettingsLSItem } from "@/lib/types";

export const updateWinner = async (
    txBuilder: MeshTxBuilder,
    blockchainProvider: BlockchainProviderType,
    wallet: IWallet,
    walletAddress: string,
    walletCollateral: UTxO,
    walletUtxos: UTxO[],
    winnerType: "Yes" | "No",
    MarketHash: string,
    market: Market,
) => {
  const { depositScriptTxHash, depositScriptTxIdx, multiSigAddress, multiSigCbor, UsdmUnit, marketToken } = setup();
  const multiSigUtxos = await blockchainProvider.fetchAddressUTxOs(multiSigAddress);

  if (!multiSigCbor) {
      throw new Error("multisig cbor doesn't exist");
  }

  const marketUtxo = await getMarketUtxo(blockchainProvider, MarketHash);

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

  let winner = getWinner(winnerType);

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
          walletCollateral.input.txHash,
          walletCollateral.input.outputIndex,
          walletCollateral.output.amount,
          walletCollateral.output.address,
      )
      .changeAddress(walletAddress)
      .selectUtxosFrom(walletUtxos)
      // .setFee("2242070")
      .complete()

  const signedTx1 = await wallet.signTx(unsignedTx);

  const lsItem: MarketUWLSItem = { market, signedTx1 }

  const lsItemMarkets = localStorage.getItem("Foreon_Update_Market") ?? "[]";
  const marketsLs: MarketUWLSItem[] = JSON.parse(lsItemMarkets);

  marketsLs.push(lsItem)
  localStorage.setItem("Foreon_Update_Market", JSON.stringify(marketsLs));
}
