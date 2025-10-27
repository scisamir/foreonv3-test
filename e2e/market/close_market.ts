import { deserializeAddress, deserializeDatum, mConStr0, mConStr1, mConStr2, mPubKeyAddress, serializeAddressObj, SLOT_CONFIG_NETWORK, unixTimeToEnclosingSlot } from "@meshsdk/core";
import { alwaysSuccessMintValidatorHash, blockchainProvider, depositScriptTxHash, depositScriptTxIdx, invalidAfter, invalidBefore, MarketCreatorNft, PrecisionFactor, txBuilder, UsdmAssetName, UsdmUnit, wallet1, wallet1Address, wallet1Collateral, wallet1SK, wallet1Utxos, wallet1VK, YesTokenName } from "../setup.js";
import { MarketAddr, MarketHash, MarketValidatorScript } from "./validator.js";
import { DepositAddr, DepositHash } from "../deposit/validator.js";
import { MarketDatumType } from "../types.js";

const marketUtxos = await blockchainProvider.fetchAddressUTxOs(DepositAddr);
const marketUtxo = marketUtxos[marketUtxos.length - 1];

const marketDatum = deserializeDatum<MarketDatumType>(marketUtxo.output.plutusData!);
// mPubKeyAddress(marketDatum.fields[0].fields[0].fields[0].bytes, marketDatum.fields[0].fields[1].fields[0]?.fields[0].fields[0].bytes)
const marketReceiverAddress = serializeAddressObj(marketDatum.fields[0], 0);
console.log("marketReceiverAddress:", marketReceiverAddress);
const { pubKeyHash: mcrPKH } = deserializeAddress(marketReceiverAddress);

const marketLovelace = marketUtxo.output.amount.find(amt => amt.unit === "lovelace");
const marketUsdm = marketUtxo.output.amount.find(amt => amt.unit === UsdmUnit);
if (!marketLovelace || !marketUsdm) throw new Error('market value invalid');

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
    .txInRedeemerValue(mConStr1([]))
    // .txInRedeemerValue(, "Mesh", { mem: rMem, steps: rSteps })
    // burn MCR NFT
    .mintPlutusScriptV3()
    .mint("-1", MarketHash, MarketCreatorNft)
    .mintingScript(MarketValidatorScript)
    .mintRedeemerValue(mConStr1([]))
    // send back market utxo
    .txOut(marketReceiverAddress, [
      { unit: "lovelace", quantity: marketLovelace.quantity },
      { unit: UsdmUnit, quantity: marketUsdm.quantity },
    ])
    .txInCollateral(
        wallet1Collateral.input.txHash,
        wallet1Collateral.input.outputIndex,
        wallet1Collateral.output.amount,
        wallet1Collateral.output.address,
    )
    .invalidBefore(invalidBefore)
    .invalidHereafter(invalidAfter)
    .changeAddress(wallet1Address)
    .selectUtxosFrom(wallet1Utxos)
    .requiredSignerHash(mcrPKH)
    .complete()

const signedTx = await wallet1.signTx(unsignedTx);

const txHash = await wallet1.submitTx(signedTx);
console.log("Close market tx hash:", txHash);
