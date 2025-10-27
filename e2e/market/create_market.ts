import { mConStr0, mConStr1, mPubKeyAddress } from "@meshsdk/core";
import { alwaysSuccessMintValidatorHash, blockchainProvider, MarketCreatorNft, MinMarketLovelace, PrecisionFactor, txBuilder, UsdmAssetName, wallet1, wallet1Address, wallet1Collateral, wallet1SK, wallet1Utxos, wallet1VK, wallet2 } from "../setup.js";
import { MarketHash, MarketValidatorScript, mParamTxHash, mParamTxIdx } from "./validator.js";
import { GlobalSettingsAddr } from "../global_settings/validator.js";
import { DepositAddr } from "../deposit/validator.js";

const multiplier = 1_000_000;
const marketToken =
  mConStr0([
    mConStr1([]),
    alwaysSuccessMintValidatorHash,
    UsdmAssetName,
    multiplier,
  ]);
// const marketEndDate = (new Date()).getTime() + (2 * 24 * 60 * 60 * 1000); // 2 days
const marketEndDate = (new Date()).getTime() + (4 * 60 * 1000); // 4 mins
const q = 10_000;

const MarketDatum = mConStr0([
  mPubKeyAddress(wallet1VK, wallet1SK),
  MarketHash,
  marketToken,
  marketEndDate,
  mConStr0([5_000, 5_000]),
  mConStr0([5_000, 5_000]),
  q,
  5_000,
  5_000,
  5_000,
  5_000,
  mConStr1([]),
]);

const MarketExecution = mConStr0([10_000, 5_000, 5_000]);

const mParamUtxo = (await blockchainProvider.fetchUTxOs(mParamTxHash, mParamTxIdx))[0];
const gsRef = (await blockchainProvider.fetchAddressUTxOs(GlobalSettingsAddr))[0];

const unsignedTx = await txBuilder
    .txIn(
        mParamUtxo.input.txHash,
        mParamUtxo.input.outputIndex,
        mParamUtxo.output.amount,
        mParamUtxo.output.address,
    )
    .mintPlutusScriptV3()
    .mint("1", MarketHash, MarketCreatorNft)
    .mintingScript(MarketValidatorScript)
    .mintRedeemerValue(MarketExecution)
    .txOut(DepositAddr, [
      { unit: "lovelace", quantity: MinMarketLovelace },
      { unit: MarketHash + MarketCreatorNft, quantity: "1" },
      { unit: alwaysSuccessMintValidatorHash + UsdmAssetName, quantity: String(q * multiplier) }
    ])
    .txOutInlineDatumValue(MarketDatum)
    .readOnlyTxInReference(gsRef.input.txHash, gsRef.input.outputIndex)
    .requiredSignerHash(wallet1VK)
    .txInCollateral(
        wallet1Collateral.input.txHash,
        wallet1Collateral.input.outputIndex,
        wallet1Collateral.output.amount,
        wallet1Collateral.output.address,
    )
    .changeAddress(wallet1Address)
    .selectUtxosFrom(wallet1Utxos)
    .complete()

const signedTx = await wallet1.signTx(unsignedTx);

const txHash = await wallet1.submitTx(signedTx);
console.log("Create market tx hash:", txHash);
