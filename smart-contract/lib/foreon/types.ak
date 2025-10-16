use aiken/crypto.{ScriptHash}
use cardano/address.{Address}
use cardano/assets.{AssetName, PolicyId}

pub type AssetType {
  is_stable: Bool,
  policy_id: PolicyId,
  asset_name: AssetName,
  multiplier: Int,
}

pub type GlobalSettingsDatum {
  min_market_amount: Int,
  allowed_assets: List<AssetType>,
  admin: ScriptHash,
}

pub type GlobalSettingsRedeemer {
  CreateGlobalSettings
  UpdateGlobalSettings
  DeleteGlobalSettings
}

pub type MarketExecution {
  CreateMarket { total_shares: Int, p_yes: Int, p_no: Int }
  CloseMarket
  YesMarket { amount: Int, user_addr: Address }
  NoMarket { amount: Int, user_addr: Address }
  YesMarketSell { amount: Int, user_addr: Address }
  NoMarketSell { amount: Int, user_addr: Address }
  Redeem { amount: Int, user_addr: Address }
  UpdateWinner
}

pub type ShareType {
  YesSide
  NoSide
}

pub type StartingQ {
  q_yes: Int,
  q_no: Int,
}

pub type StartingP {
  p_yes: Int,
  p_no: Int,
}

pub type MarketDatum {
  market_creator_address: Address,
  market_validator_hash: ScriptHash,
  // Token/Asset used in the market e.g. USDC
  market_token: AssetType,
  // When the event wil end
  end_date: Int,
  // Staring no. of q_yes and q_no
  starting_q: StartingQ,
  // Starting prices of yes and no tokens
  starting_p: StartingP,
  // Total number of shares minted
  q: Int,
  // Total Yes shares existing
  q_yes: Int,
  // Total No shares existing
  q_no: Int,
  // Current price of Yes shares
  p_yes: Int,
  // Current price of No shares
  p_no: Int,
  // Winning side
  winner: Option<ShareType>,
}
