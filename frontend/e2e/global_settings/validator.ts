import { applyParamsToScript, builtinByteString, outputReference, resolveScriptHash, serializePlutusScript } from "@meshsdk/core";
import { setup } from "../setup";

const { blueprint, multisigHash } = setup();

const gsParamTxHash = "948abc3ac9938ef25fd8d93330b541a6c3e73cd4d6620b02220845ea4e365022";
const gsParamTxIdx = 14;

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
