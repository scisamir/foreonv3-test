import { IWallet, mConStr0, mConStr1, MeshTxBuilder, UTxO } from "@meshsdk/core";
import { GlobalSettingsAddr, GlobalSettingsHash, GlobalSettingsValidatorScript } from "./validator";
import { setup } from "../setup";
import { BlockchainProviderType } from "../types";
import { AllowedAsset, SettingsLSItem, GlobalSetting } from "@/lib/types";

export const updateSettings = async (
    txBuilder: MeshTxBuilder,
    blockchainProvider: BlockchainProviderType,
    wallet: IWallet,
    walletAddress: string,
    walletCollateral: UTxO,
    walletUtxos: UTxO[],
    minMarketAmount: number,
    allowedAssets: AllowedAsset[],
    globalSetting: GlobalSetting,
) => {
  const { GlobalSettingsNft, multiSigAddress, multiSigCbor, multisigHash } = setup();
  const multiSigUtxos = await blockchainProvider.fetchAddressUTxOs(multiSigAddress);

  let AllowedAssets = [];

  for (let i = 0; i < allowedAssets.length; i++) {
    const asset = allowedAssets[i];

    let newAsset = mConStr0([
      asset.isStable ? mConStr1([]) : mConStr0([]),
      asset.policyId,
      asset.assetNameHex,
      asset.multiplier,
    ])

    AllowedAssets.push(newAsset);
  }

  const GlobalSettingsDatum = mConStr0([
    minMarketAmount,
    AllowedAssets,
    multisigHash,
  ]);

  if (!multiSigCbor) {
      throw new Error("multisig cbor doesn't exist");
  }

  const gsUtxo = (await blockchainProvider.fetchAddressUTxOs(GlobalSettingsAddr))[0];

  const unsignedTx = await txBuilder
      // signing utxo
      .txIn(
          multiSigUtxos[0].input.txHash,
          multiSigUtxos[0].input.outputIndex,
          multiSigUtxos[0].output.amount,
          multiSigUtxos[0].output.address,
      )
      .txInScript(multiSigCbor)
      // global settings utxo
      .spendingPlutusScriptV3()
      .txIn(
          gsUtxo.input.txHash,
          gsUtxo.input.outputIndex,
          gsUtxo.output.amount,
          gsUtxo.output.address,
      )
      .txInScript(GlobalSettingsValidatorScript)
      .txInInlineDatumPresent()
      .txInRedeemerValue(mConStr1([]))
      // send global settings
      .txOut(GlobalSettingsAddr, [{ unit: GlobalSettingsHash + GlobalSettingsNft, quantity: "1" }])
      .txOutInlineDatumValue(GlobalSettingsDatum)
      // send back multisig value to multisig
      .txOut(multiSigAddress, multiSigUtxos[0].output.amount)
      .txInCollateral(
          walletCollateral.input.txHash,
          walletCollateral.input.outputIndex,
          walletCollateral.output.amount,
          walletCollateral.output.address,
      )
      .changeAddress(walletAddress)
      .selectUtxosFrom(walletUtxos)
      .complete()

  const signedTx1 = await wallet.signTx(unsignedTx, true);

  const lsItem: SettingsLSItem = { globalSetting: globalSetting, signedTx1: signedTx1 }
  localStorage.setItem("Foreon_Update_Settings", JSON.stringify(lsItem));
}
