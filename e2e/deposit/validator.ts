import { applyParamsToScript, builtinByteString, resolveScriptHash, serializePlutusScript } from "@meshsdk/core";
import { blueprint } from "../setup.js";
import { GlobalSettingsHash } from "../global_settings/validator.js";

const DepositValidator = blueprint.validators.filter(v => 
    v.title.includes("deposit.deposit_validator.spend")
);

const DepositValidatorScript = applyParamsToScript(
    DepositValidator[0].compiledCode,
    [
        builtinByteString(GlobalSettingsHash),
    ],
    "JSON"
);

const DepositHash = resolveScriptHash(DepositValidatorScript, "V3");

const DepositAddr = serializePlutusScript(
    { code: DepositValidatorScript, version: "V3" },
).address;

export {
    DepositValidatorScript,
    DepositHash,
    DepositAddr,
}
