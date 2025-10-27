import {
    applyParamsToScript,
    mConStr0,
    mConStr1,
    NativeScript,
    resolveNativeScriptHash,
    resolveScriptHash,
    serializeNativeScript,
    stringToHex,
} from "@meshsdk/core";
import blueprint from "../../smart-contract/plutus.json" with { type: "json" };

export function setup() {
    // Multisig hashes should be fetched from the DB instead
    const wallet1VK = "96cbb27c96daf8cab890de6d7f87f5ffd025bf8ac80717cbc4fae7da";
    const wallet2VK = "331da30f7c8fea429e2bdc161efde817cbb06f78a53ef5ceee42c9a3";

    // Setup multisig
    const nativeScript: NativeScript = {
        type: "all",
        scripts: [
            {
                type: "sig",
                keyHash: wallet1VK,
            },
            {
                type: "sig",
                keyHash: wallet2VK,
            },
        ],
    };
    const { address: multiSigAddress, scriptCbor: multiSigCbor } = serializeNativeScript(nativeScript);

    const multisigHash = resolveNativeScriptHash(nativeScript);

    // test mint
    // Always success mint validator
    const alwaysSuccessMintValidator = "585401010029800aba2aba1aab9eaab9dab9a4888896600264653001300600198031803800cc0180092225980099b8748000c01cdd500144c9289bae30093008375400516401830060013003375400d149a26cac8009";
    const alwaysSuccessValidatorMintScript = applyParamsToScript(
        alwaysSuccessMintValidator,
        [],
        "JSON",
    );
    const alwaysSuccessMintValidatorHash = resolveScriptHash(alwaysSuccessValidatorMintScript, "V3");
    console.log("alwaysSuccessMintValidatorHash:", alwaysSuccessMintValidatorHash);

    // Constants
    const YesTokenName = stringToHex("Yes");
    const NoTokenName = stringToHex("No");
    const GlobalSettingsNft = stringToHex("GSN");
    const MarketCreatorNft = stringToHex("MCN");
    const PrecisionFactor = 10_000;
    const UsdmAssetName = stringToHex("USDM");
    const UsdmUnit = alwaysSuccessMintValidatorHash + UsdmAssetName;

    // Reference scripts
    const depositScriptTxHash = "e56b59c58903ba34ca5c4ff6e5222ad2990bfb136aa7cdcb90cf3eddf6ce154c";
    const depositScriptTxIdx = 0;

    const multiplier = 1_000_000;
    const marketToken =
    mConStr0([
        mConStr1([]),
        alwaysSuccessMintValidatorHash,
        UsdmAssetName,
        multiplier,
    ]);

    return {
        blueprint,
        multisigHash,
        multiSigAddress,
        multiSigCbor,
        alwaysSuccessValidatorMintScript,
        alwaysSuccessMintValidatorHash,
        multiplier,
        marketToken,
        // Constants
        YesTokenName,
        NoTokenName,
        GlobalSettingsNft,
        MarketCreatorNft,
        PrecisionFactor,
        UsdmAssetName,
        UsdmUnit,
        // Ref scripts
        depositScriptTxHash,
        depositScriptTxIdx,
    }
}
