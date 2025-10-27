import {
    BlockfrostProvider,
    MaestroProvider,
    MeshTxBuilder,
    MeshWallet,
    NativeScript,
    SLOT_CONFIG_NETWORK,
    UTxO,
    applyParamsToScript,
    deserializeAddress,
    resolveNativeScriptHash,
    resolveScriptHash,
    serializeNativeScript,
    stringToHex,
    unixTimeToEnclosingSlot,
} from "@meshsdk/core";
import dotenv from "dotenv";
dotenv.config();
import blueprint from "../smart-contract/plutus.json" with { type: "json" };

// Setup blockhain provider as Maestro
const maestroKey = process.env.MAESTRO_KEY;
if (!maestroKey) {
    throw new Error("MAESTRO_KEY does not exist");
}
const blockchainProvider = new MaestroProvider({
    network: 'Preprod',
    apiKey: maestroKey,
});

// Setup blockhain provider as Blockfrost
const blockfrostId = process.env.BLOCKFROST_ID;
if (!blockfrostId) {
    throw new Error("BLOCKFROST_ID does not exist");
}
const blockfrostProvider = new BlockfrostProvider(blockfrostId);

// import admin's wallet passphrase and initialize the wallet
const wallet1Passphrase = process.env.WALLET_PASSPHRASE_ONE;
if (!wallet1Passphrase) {
    throw new Error("WALLET_PASSPHRASE_ONE does not exist");
}
const wallet1 = new MeshWallet({
    networkId: 0,
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    key: {
        type: "mnemonic",
        words: wallet1Passphrase.split(' ')
    },
});

const wallet1Address = await wallet1.getChangeAddress();

const wallet1Utxos = await wallet1.getUtxos();
// const wallet1Collateral: UTxO = (await blockchainProvider.fetchUTxOs("5d69f9d07b31dc6562c0cc9967edc78cf46f76a417f03b235a664b02797731dd", 1))[0]
const wallet1Collateral: UTxO = (await wallet1.getCollateral())[0]
if (!wallet1Collateral) {
    throw new Error('No collateral utxo found');
}

const { pubKeyHash: wallet1VK, stakeCredentialHash: wallet1SK } = deserializeAddress(wallet1Address);

// Setup wallet2
const wallet2Passphrase = process.env.WALLET_PASSPHRASE_TWO;
if (!wallet2Passphrase) {
    throw new Error("WALLET_PASSPHRASE_TWO does not exist");
}
const wallet2 = new MeshWallet({
    networkId: 0,
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    key: {
        type: "mnemonic",
        words: wallet2Passphrase.split(' ')
    },
});
// Needs to be changed below to wallet 2 address;
const wallet2Address = await wallet2.getChangeAddress();
const { pubKeyHash: wallet2VK, stakeCredentialHash: wallet2SK } = deserializeAddress(wallet2Address);

console.log("wallet1VK:", wallet1VK);
console.log("wallet2VK:", wallet2VK);

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
// console.log("nativeScript:", nativeScript);
// console.log("serializeNativeScript:", serializeNativeScript(nativeScript));
const multisigHash = resolveNativeScriptHash(nativeScript);
// console.log("multisigHash:", multisigHash);
const multiSigUtxos = await blockchainProvider.fetchAddressUTxOs(multiSigAddress);
// console.log("multiSigUtxos:", multiSigUtxos);
// console.log("multiSigUtxos:", multiSigUtxos[0].output.amount);

// Create transaction builder
const txBuilder = new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    // evaluator: blockchainProvider,
    // evaluator: blockfrostProvider,
    verbose: false,
});
txBuilder.setNetwork('preprod');
// txBuilder.txEvaluationMultiplier = 1.6

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
const MinMarketLovelace = "3000000";

// Reference scripts
const depositScriptTxHash = "e56b59c58903ba34ca5c4ff6e5222ad2990bfb136aa7cdcb90cf3eddf6ce154c";
const depositScriptTxIdx = 0;

const invalidBefore = unixTimeToEnclosingSlot(
    (Date.now() - 50000),
    SLOT_CONFIG_NETWORK.preprod
)

const invalidAfter = unixTimeToEnclosingSlot(
    (Date.now() + 30 * 60 * 1000), // 30 mins
    SLOT_CONFIG_NETWORK.preprod
)

export {
    blueprint,
    maestroKey,
    wallet1Passphrase,
    blockchainProvider,
    txBuilder,
    wallet1,
    wallet1Address,
    wallet1VK,
    wallet1SK,
    wallet1Utxos,
    wallet1Collateral,
    wallet2,
    wallet2Address,
    wallet2VK,
    wallet2SK,
    multisigHash,
    multiSigAddress,
    multiSigCbor,
    multiSigUtxos,
    alwaysSuccessValidatorMintScript,
    alwaysSuccessMintValidatorHash,
    invalidBefore,
    invalidAfter,
    // Constants
    YesTokenName,
    NoTokenName,
    GlobalSettingsNft,
    MarketCreatorNft,
    PrecisionFactor,
    UsdmAssetName,
    UsdmUnit,
    MinMarketLovelace,
    // Ref scripts
    depositScriptTxHash,
    depositScriptTxIdx,
}
