import { deserializeDatum, UTxO } from "@meshsdk/core";
import { DepositAddr } from "./deposit/validator";
import { BlockchainProviderType, MarketDatumType } from "./types";

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

export {
  getMarketUtxo,
  getMarketUtxoOptimized,
}
