import { resolveScriptHash, serializePlutusScript } from "@meshsdk/core";
import { applyCborEncoding } from "@meshsdk/core-csl";
import { blockchainProvider, txBuilder, wallet1, wallet1Address, wallet1Collateral, wallet1Utxos } from "../setup.js";
import { DepositValidatorScript } from "../deposit/validator.js";

const refScript = applyCborEncoding("5857010100323232323225333002323232323253330073370e900118041baa00113233224a060160026016601800260126ea800458c024c02800cc020008c01c008c01c004c010dd50008a4c26cacae6955ceaab9e5742ae89");
// const refScriptHash = resolveScriptHash(refScript, "V3");
const refAddress = serializePlutusScript(
    { code: refScript, version: "V3" }
).address;

const theUtxo = (await blockchainProvider.fetchUTxOs("abc2437d60829d0b775d169c6bb0f049e3d7894136efb4ccb09e52e70c987c5d", 10))[0];

const unsignedTx = await txBuilder
    .txIn(
        theUtxo.input.txHash,
        theUtxo.input.outputIndex,
        theUtxo.output.amount,
        theUtxo.output.address,
    )
    .txOut(refAddress, [])
    .txOutReferenceScript(DepositValidatorScript, "V3")
    .changeAddress(wallet1Address)
    .selectUtxosFrom(wallet1Utxos)
    .txInCollateral(
        wallet1Collateral.input.txHash,
        wallet1Collateral.input.outputIndex,
        wallet1Collateral.output.amount,
        wallet1Collateral.output.address,
    )
    .complete()

const signedTx = await wallet1.signTx(unsignedTx);
const txHash = await wallet1.submitTx(signedTx);

console.log('save deposit script tx Hash:', txHash);
