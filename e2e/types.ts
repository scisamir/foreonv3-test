import { BuiltinByteString, ConStr0, ConStr1, Integer, PubKeyAddress } from "@meshsdk/core";

// Asset Type
type AssetType = ConStr0<[
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

type MarketDatumType = ConStr0<[
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

export {
  MarketDatumType,
}
