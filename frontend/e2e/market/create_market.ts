import { IWallet, mConStr0, mConStr1, MeshTxBuilder, mPubKeyAddress, UTxO } from "@meshsdk/core";
import { GlobalSettingsAddr } from "../global_settings/validator";
import { DepositAddr } from "../deposit/validator";
import { setup } from "../setup";
import { BlockchainProviderType } from "../types";
import { getMarketValidator } from "./validator";

export const createMarket = async (
    txBuilder: MeshTxBuilder,
    blockchainProvider: BlockchainProviderType,
    wallet: IWallet,
    walletAddress: string,
    walletCollateral: UTxO,
    walletUtxos: UTxO[],
    walletVK: string,
    walletSK: string,
    q: number,
    pYesParam: number,
    pNoParam: number,
) => {
  const { alwaysSuccessMintValidatorHash, MarketCreatorNft, UsdmAssetName, PrecisionFactor, multiplier, marketToken } = setup();
  const { MarketHash, MarketValidatorScript, mParamTxHash, mParamTxIdx } = getMarketValidator(walletUtxos);

  const marketEndDate = (new Date()).getTime() + (2 * 24 * 60 * 60 * 1000); // 2 days
  const pYes = Math.floor(pYesParam * PrecisionFactor);
  const pNo = Math.floor(pNoParam * PrecisionFactor);
  const qYes = Math.floor(pYesParam * q);
  const qNo = Math.floor(pNoParam * q);

  console.log("pYesParam:", pYesParam);
  console.log("pNoParam:", pNoParam);
  console.log("pYes:", pYes);
  console.log("pNo:", pNo);
  console.log("qYes:", qYes);
  console.log("qNo:", qNo);

  const MarketDatum = mConStr0([
    mPubKeyAddress(walletVK, walletSK),
    MarketHash,
    marketToken,
    marketEndDate,
    mConStr0([qYes, qNo]),
    mConStr0([pYes, pNo]),
    q,
    qYes,
    qNo,
    pYes,
    pNo,
    mConStr1([]),
  ]);

  const MarketExecution = mConStr0([q, pYes, pNo]);

  const mParamUtxo = (await blockchainProvider.fetchUTxOs(mParamTxHash, mParamTxIdx))[0];
  const gsRef = (await blockchainProvider.fetchAddressUTxOs(GlobalSettingsAddr))[0];

  const unsignedTx = await txBuilder
      .txIn(
          mParamUtxo.input.txHash,
          mParamUtxo.input.outputIndex,
          mParamUtxo.output.amount,
          mParamUtxo.output.address,
      )
      .mintPlutusScriptV3()
      .mint("1", MarketHash, MarketCreatorNft)
      .mintingScript(MarketValidatorScript)
      .mintRedeemerValue(MarketExecution)
      .txOut(DepositAddr, [
        { unit: MarketHash + MarketCreatorNft, quantity: "1" },
        { unit: alwaysSuccessMintValidatorHash + UsdmAssetName, quantity: String(q * multiplier) }
      ])
      .txOutInlineDatumValue(MarketDatum)
      .readOnlyTxInReference(gsRef.input.txHash, gsRef.input.outputIndex)
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
