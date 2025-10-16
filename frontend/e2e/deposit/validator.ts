import { applyParamsToScript, builtinByteString, deserializeAddress, outputReference, resolveScriptHash, serializePlutusScript } from "@meshsdk/core";
import { setup } from "../setup";
import { GlobalSettingsHash } from "../global_settings/validator";

const { blueprint } = setup();

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
