import { applyParamsToScript, builtinByteString, outputReference, resolveScriptHash, serializePlutusScript } from "@meshsdk/core";
import { setup } from "../setup";

const { blueprint, multisigHash } = setup();

// const gsParamTxHash = "ed533846d1dfddc7602d8c624eeb80b354650f3820f258431c28861e4e22730a";
// const gsParamTxIdx = 8;
const gsParamTxHash = "6a48b3a11cf75ec003cef9904f88f83ae126277774540772241f5b2f571e1862";
const gsParamTxIdx = 4;

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
