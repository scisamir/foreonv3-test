import { applyParamsToScript, builtinByteString, outputReference, resolveScriptHash, serializePlutusScript } from "@meshsdk/core";
import { blueprint } from "../setup.js";
import { GlobalSettingsHash } from "../global_settings/validator.js";
import { DepositHash } from "../deposit/validator.js";

const mParamTxHash = "880e079c6e39d17d5309d6a893c28729dd9dd197f9f24bc759be4c045c15a7bf";
const mParamTxIdx = 2;

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
