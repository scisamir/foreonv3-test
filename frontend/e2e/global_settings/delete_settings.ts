import { mConStr0, mConStr1, mConStr2 } from "@meshsdk/core";
import { alwaysSuccessMintValidatorHash, blockchainProvider, GlobalSettingsNft, multiSigAddress, multiSigCbor, multisigHash, multiSigUtxos, txBuilder, UsdmAssetName, wallet1, wallet1Address, wallet1Collateral, wallet1Utxos, wallet2 } from "../setup.js";
import { GlobalSettingsAddr, GlobalSettingsHash, GlobalSettingsValidatorScript } from "./validator.js";

const AllowedAssets = [
  mConStr0([
    mConStr1([]),
    alwaysSuccessMintValidatorHash,
    UsdmAssetName,
    1_000_000,
  ]),
];

const GlobalSettingsDatum = mConStr0([
  10_000,
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
    .txInRedeemerValue(mConStr2([]))
    // burn global settings NFT
    .mintPlutusScriptV3()
    .mint("-1", GlobalSettingsHash, GlobalSettingsNft)
    .mintingScript(GlobalSettingsValidatorScript)
    .mintRedeemerValue(mConStr2([]))
    // send back multisig value to multisig
    .txOut(multiSigAddress, multiSigUtxos[0].output.amount)
    .txInCollateral(
        wallet1Collateral.input.txHash,
        wallet1Collateral.input.outputIndex,
        wallet1Collateral.output.amount,
        wallet1Collateral.output.address,
    )
    .changeAddress(wallet1Address)
    .selectUtxosFrom(wallet1Utxos)
    .complete()

const signedTx1 = await wallet1.signTx(unsignedTx, true);
const signedTx2 = await wallet2.signTx(signedTx1, true);

const txHash = await wallet1.submitTx(signedTx2);
console.log("Delete global settings tx hash:", txHash);
