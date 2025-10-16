import { DepositAddr } from "../deposit/validator.js";
import { GlobalSettingsAddr } from "../global_settings/validator.js";
import { MarketAddr } from "../market/validator.js";
import { blockchainProvider } from "../setup.js"

const gsUtxo = await blockchainProvider.fetchAddressUTxOs(GlobalSettingsAddr);
console.log("Global Settings Utxo:", gsUtxo);

const depositUtxo = await blockchainProvider.fetchAddressUTxOs(DepositAddr);
console.log("Deposit Utxo:", depositUtxo);

const marketUtxo = await blockchainProvider.fetchAddressUTxOs(MarketAddr);
console.log("Market Utxo:", marketUtxo);
