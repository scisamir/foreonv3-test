import { applyParamsToScript, builtinByteString, outputReference, resolveScriptHash, serializePlutusScript, UTxO } from "@meshsdk/core";
import { setup } from "../setup";
import { GlobalSettingsHash } from "../global_settings/validator";
import { DepositHash } from "../deposit/validator";

export const getMarketValidator = (walletUtxos: UTxO[]) => {
    const { blueprint } = setup();

    // get ada only utxos if not get any available utxo
    let eligibleUtxos = (walletUtxos.filter(utxo => utxo.output.amount.length === 1 && utxo.output.amount[0].quantity > "5000000"))[0];
    if (!eligibleUtxos) {
        eligibleUtxos = walletUtxos[0];
    }

    const mParamTxHash = eligibleUtxos.input.txHash;
    const mParamTxIdx = eligibleUtxos.input.outputIndex;

    const MarketValidator = blueprint.validators.filter(v => 
        v.title.includes("market.market_validator.mint")
    );

    const MarketValidatorScript = applyParamsToScript(
        MarketValidator[0].compiledCode,
        [
            builtinByteString(DepositHash),
            builtinByteString(GlobalSettingsHash),
            outputReference(mParamTxHash, mParamTxIdx),
        ],
        "JSON"
    );

    const MarketHash = resolveScriptHash(MarketValidatorScript, "V3");

    const MarketAddr = serializePlutusScript(
        { code: MarketValidatorScript, version: "V3" },
    ).address;

    return {
        MarketValidatorScript,
        MarketHash,
        MarketAddr,
        mParamTxHash,
        mParamTxIdx,
    }
}
