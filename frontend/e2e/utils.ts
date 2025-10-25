import { deserializeDatum, UTxO } from "@meshsdk/core";
import { DepositAddr } from "./deposit/validator";
import { BlockchainProviderType, GlobalSettingsType, MarketDatumType } from "./types";
import { GlobalSettingsAddr } from "./global_settings/validator";
import { AllowedAsset, GlobalSetting } from "@/lib/types";

const getMarketUtxo = async (blockchainProvider: BlockchainProviderType, MarketHash: string) => {
  const depositUtxos = await blockchainProvider.fetchAddressUTxOs(DepositAddr);

  const marketUtxo = depositUtxos.find(utxo => {
    const utxoPlutusData = utxo.output.plutusData;
    if (!utxoPlutusData) return;
    const utxoDatum = deserializeDatum<MarketDatumType>(utxoPlutusData);

    return utxoDatum.fields[1].bytes === MarketHash;
  });
  if (!marketUtxo) throw new Error('market utxo not found!');

  return marketUtxo;
};

const getMarketUtxoOptimized = async (depositUtxos: UTxO[], MarketHash: string) => {
  const marketUtxo = depositUtxos.find(utxo => {
    const utxoPlutusData = utxo.output.plutusData;
    if (!utxoPlutusData) return;
    const utxoDatum = deserializeDatum<MarketDatumType>(utxoPlutusData);

    return utxoDatum.fields[1].bytes === MarketHash;
  });

  return marketUtxo;
};

const fetchGlobalSettings = async (blockchainProvider: BlockchainProviderType | null) => {
  if (!blockchainProvider) throw new Error ('init err');
  let newSetting: GlobalSetting = {id: 0, minimumMarketAmount: 0, adminMultisig: "", allowedAssets: []};

  try {
    const globalSettingsUtxo = (await blockchainProvider.fetchAddressUTxOs(GlobalSettingsAddr))[0];
    if (!globalSettingsUtxo) return;

    const gsPlutusData = globalSettingsUtxo.output.plutusData
    if (!gsPlutusData) return;
    const gsDatum = deserializeDatum<GlobalSettingsType>(gsPlutusData);

    const id = globalSettingsUtxo.input.txHash.slice(0, 5);
    const minimumMarketAmount = Number(gsDatum.fields[0].int);
    const adminMultisig = gsDatum.fields[2].bytes;

    const allowedAssets: AllowedAsset[] = [];
    const allowedAssetsD = gsDatum.fields[1].list
    for (let i = 0; i < allowedAssetsD.length; i++) {
      const asset = allowedAssetsD[i];

      const isStable = Number(asset.fields[0].constructor) === 0 ? false : true;
      const policyId = asset.fields[1].bytes;
      const assetNameHex = asset.fields[2].bytes;
      const multiplier = Number(asset.fields[3].int);

      allowedAssets.push({
        isStable,
        policyId,
        assetNameHex,
        multiplier,
      })
    }

    newSetting = {id, minimumMarketAmount, adminMultisig, allowedAssets};
  } catch (e) {
    console.error("e:", e);
  }

  return newSetting;
}

export {
  getMarketUtxo,
  getMarketUtxoOptimized,
  fetchGlobalSettings,
}
