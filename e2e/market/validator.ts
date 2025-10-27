import { applyParamsToScript, builtinByteString, outputReference, resolveScriptHash, serializePlutusScript } from "@meshsdk/core";
import { blueprint } from "../setup.js";
import { GlobalSettingsHash } from "../global_settings/validator.js";
import { DepositHash } from "../deposit/validator.js";

const mParamTxHash = "e56b59c58903ba34ca5c4ff6e5222ad2990bfb136aa7cdcb90cf3eddf6ce154c";
const mParamTxIdx = 1;

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

export {
    MarketValidatorScript,
    MarketHash,
    MarketAddr,
    mParamTxHash,
    mParamTxIdx,
}
