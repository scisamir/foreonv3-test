import { BuiltinByteString, ConStr0, ConStr1, Integer, List, MaestroProvider, PubKeyAddress, ScriptHash } from "@meshsdk/core";

// Blockchain provider
export type BlockchainProviderType = MaestroProvider;

// Asset Type
export type AssetType = ConStr0<[
  ConStr0 | ConStr1,
  BuiltinByteString,
  BuiltinByteString,
  Integer,
]>;

// StartingQ
type StartingQ = ConStr0<[
  Integer,
  Integer,
]>;

// StartingP
type StartingP = ConStr0<[
  Integer,
  Integer,
]>;

type Winner = ConStr1 | ConStr0<[ConStr0 | ConStr1]>;

// Market Datum
export type MarketDatumType = ConStr0<[
  PubKeyAddress,
  BuiltinByteString,
  AssetType,
  Integer,
  StartingQ,
  StartingP,
  Integer,
  Integer,
  Integer,
  Integer,
  Integer,
  Winner,
]>;

// Global Settings
export type GlobalSettingsType = ConStr0<[
  Integer,
  List<AssetType>,
  ScriptHash
]>;
