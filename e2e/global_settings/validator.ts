import { applyParamsToScript, builtinByteString, outputReference, resolveScriptHash, serializePlutusScript } from "@meshsdk/core";
import { blueprint, multisigHash } from "../setup.js";

const gsParamTxHash = "abc2437d60829d0b775d169c6bb0f049e3d7894136efb4ccb09e52e70c987c5d";
const gsParamTxIdx = 11;

const GlobalSettingsValidator = blueprint.validators.filter(v => 
    v.title.includes("global_settings.global_settings.spend")
);

const GlobalSettingsValidatorScript = applyParamsToScript(
    GlobalSettingsValidator[0].compiledCode,
    [
        builtinByteString(multisigHash),
        outputReference(gsParamTxHash, gsParamTxIdx),
    ],
    "JSON"
);

const GlobalSettingsHash = resolveScriptHash(GlobalSettingsValidatorScript, "V3");

const GlobalSettingsAddr = serializePlutusScript(
    { code: GlobalSettingsValidatorScript, version: "V3" },
).address;

export {
    GlobalSettingsValidatorScript,
    GlobalSettingsHash,
    GlobalSettingsAddr,
    gsParamTxHash,
    gsParamTxIdx,
}
