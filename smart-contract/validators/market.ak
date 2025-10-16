use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{ScriptHash, VerificationKeyHash}
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{AssetName, PolicyId, from_asset, from_lovelace, quantity_of}
use cardano/transaction.{
  InlineDatum, Input, NoDatum, Output, OutputReference, Transaction, find_input,
  placeholder,
}
use foreon/constants.{
  global_settings_nft, market_creator_nft, no_token_name, precision_factor,
  yes_token_name,
}
use foreon/types.{
  AssetType, CloseMarket, CreateMarket, GlobalSettingsDatum, MarketDatum,
  MarketExecution, NoMarket, NoMarketSell, Redeem, StartingP, StartingQ,
  YesMarket, YesMarketSell,
}
use foreon/utils.{get_global_settings, verify_market_datum}
use mocktail/virgin_address.{mock_pub_key_address}
use mocktail/virgin_key_hash.{mock_pub_key_hash, mock_script_hash}
use mocktail/virgin_output_reference.{mock_utxo_ref}
use test_utils/constants_t.{
  admin_t, deposit_validator_hash_t, global_settings_validator_hash_t,
  market_validator_pid_t, utxo_ref_t,
}

validator market_validator(
  deposit_validator_hash: ScriptHash,
  global_settings_hash: ScriptHash,
  // parameter to make the market validator policy ID unique for each market
  utxo_ref: OutputReference,
) {
  mint(redeemer: MarketExecution, policy_id: PolicyId, tx: Transaction) {
    let Transaction {
      mint,
      outputs,
      reference_inputs,
      inputs,
      extra_signatories,
      ..
    } = tx

    expect [Pair(name, quantity)] =
      mint |> assets.tokens(policy_id) |> dict.to_pairs()

    when redeemer is {
      CreateMarket { total_shares, p_yes: starting_p_yes, p_no: starting_p_no } ->
        handle_create_market(
          name,
          quantity,
          deposit_validator_hash,
          inputs,
          outputs,
          reference_inputs,
          global_settings_hash,
          utxo_ref,
          policy_id,
          extra_signatories,
          total_shares,
          starting_p_yes,
          starting_p_no,
        )
      CloseMarket -> handle_close_market(name, quantity)
      YesMarket { .. } -> handle_yes_market_buy(name, quantity)
      NoMarket { .. } -> handle_no_market_buy(name, quantity)
      Redeem { .. } | YesMarketSell { .. } | NoMarketSell { .. } ->
        handle_redeem_market(quantity)
      _ -> False
    }
  }

  else(_) {
    fail
  }
}

fn handle_create_market(
  asset_name: AssetName,
  asset_amount: Int,
  deposit_validator_hash: ScriptHash,
  inputs: List<Input>,
  outputs: List<Output>,
  ref_inputs: List<Input>,
  global_settings_hash: ScriptHash,
  utxo_ref: OutputReference,
  policy_id: PolicyId,
  extra_signatories: List<VerificationKeyHash>,
  total_shares: Int,
  starting_p_yes: Int,
  starting_p_no: Int,
) {
  // filter outputs going to the deposit validator
  let deposit_validator_ouptuts =
    outputs
      |> list.filter(
          fn(output) {
            (output.address.payment_credential == Script(deposit_validator_hash))?
          },
        )
  expect Some(deposit_validator_ouptut) =
    deposit_validator_ouptuts |> list.at(0)

  expect InlineDatum(deposit_datum_data) = deposit_validator_ouptut.datum
  expect MarketDatum {
    market_creator_address,
    market_validator_hash,
    market_token,
    starting_q,
    starting_p,
    q,
    q_yes,
    q_no,
    p_yes,
    p_no,
    winner,
    ..
  } = deposit_datum_data

  // make sure the data in the datum are correct
  verify_market_datum(
    starting_p,
    starting_q,
    q,
    q_yes,
    q_no,
    p_yes,
    p_no,
    winner,
    total_shares,
    starting_p_yes,
    starting_p_no,
  )

  let global_settings_datum =
    get_global_settings(global_settings_hash, ref_inputs)
  expect GlobalSettingsDatum { allowed_assets, min_market_amount, .. } =
    global_settings_datum

  let AssetType {
    policy_id: mt_policy_id,
    asset_name: mt_asset_name,
    multiplier,
    ..
  } = market_token

  // utxo ref must be spent
  expect Some(_) = find_input(inputs, utxo_ref)

  expect VerificationKey(market_creator_vkh) =
    market_creator_address.payment_credential

  // The cummulative starting prices of yes and no tokens must be equal to 1
  let starting_p_yes_no = starting_p_yes + starting_p_no
  let p_yes_no_total = starting_p_yes_no / precision_factor

  let deposit_amount =
    quantity_of(deposit_validator_ouptut.value, mt_policy_id, mt_asset_name)

  and {
    // Must provide an exact allowed amount an allowed token
    (deposit_amount >= min_market_amount * multiplier)?,
    // Must provide deposit amount equivalent of total shares
    (deposit_amount == total_shares * multiplier)?,
    // Market token must be an allowed asset
    (allowed_assets |> list.has(market_token))?,
    // There must be only one deposit validator output
    (list.length(deposit_validator_ouptuts) == 1)?,
    // Market creator must mint a single market creator NFT
    (asset_name == market_creator_nft)?,
    (asset_amount == 1)?,
    // Market validator hash in the market datum should be correct
    (policy_id == market_validator_hash)?,
    // Transaction must be signed by the market creator
    list.has(extra_signatories, market_creator_vkh)?,
    // The cummulative starting prices of yes and no tokens must be equal to 1
    (p_yes_no_total == 1)?,
  }
}

fn handle_close_market(asset_name: AssetName, asset_amount: Int) {
  and {
    // Market creator NFT has to be burned
    (asset_name == market_creator_nft)?,
    (asset_amount == -1)?,
  }
}

fn handle_yes_market_buy(asset_name: AssetName, asset_amount: Int) {
  and {
    // User must mint yes tokens
    (asset_name == yes_token_name)?,
    (asset_amount > 0)?,
  }
}

fn handle_no_market_buy(asset_name: AssetName, asset_amount: Int) {
  and {
    // User must mint no tokens
    (asset_name == no_token_name)?,
    (asset_amount > 0)?,
  }
}

fn handle_redeem_market(asset_amount: Int) {
  // User must burn tokens
  (asset_amount < 0)?
}

// Tests
test test_create_market() {
  let gsn = from_asset(global_settings_validator_hash_t, global_settings_nft, 1)
  let market_creator_address = mock_pub_key_address(0, None)
  let market_creator_vkh = mock_pub_key_hash(0)

  let t_usdc_pid = mock_script_hash(3)
  let t_usdc_an = "USDC"
  let multiplier = 1_000_000
  let m_asset =
    AssetType {
      is_stable: True,
      policy_id: t_usdc_pid,
      asset_name: t_usdc_an,
      multiplier,
    }

  let gs_input_datum =
    GlobalSettingsDatum {
      admin: admin_t,
      min_market_amount: 10_000,
      allowed_assets: [m_asset],
    }
  let gs_input_utxo_ref = mock_utxo_ref(0, 11)
  let gs_input =
    Input {
      output_reference: gs_input_utxo_ref,
      output: Output {
        address: Address {
          payment_credential: Script(global_settings_validator_hash_t),
          stake_credential: None,
        },
        value: assets.merge(from_lovelace(2_000_000), gsn),
        datum: InlineDatum(gs_input_datum),
        reference_script: None,
      },
    }

  let utxo_ref_input =
    Input {
      output_reference: utxo_ref_t,
      output: Output {
        address: Address {
          payment_credential: Script(mock_script_hash(37)),
          stake_credential: None,
        },
        value: from_lovelace(2_000_000),
        datum: NoDatum,
        reference_script: None,
      },
    }

  let depositor_output =
    Output {
      address: Address {
        payment_credential: Script(deposit_validator_hash_t),
        stake_credential: None,
      },
      value: assets.merge(
        from_lovelace(2_000_000),
        from_asset(t_usdc_pid, t_usdc_an, 10_000 * multiplier),
      )
        |> assets.add(market_validator_pid_t, market_creator_nft, 1),
      datum: InlineDatum(
        MarketDatum {
          market_creator_address,
          market_validator_hash: market_validator_pid_t,
          market_token: m_asset,
          end_date: 1758493411,
          starting_q: StartingQ { q_yes: 5_000, q_no: 5_000 },
          starting_p: StartingP { p_yes: 5_000, p_no: 5_000 },
          q: 10_000,
          q_yes: 5_000,
          q_no: 5_000,
          p_yes: 5_000,
          p_no: 5_000,
          winner: None,
        },
      ),
      reference_script: None,
    }

  let mint = from_asset(market_validator_pid_t, market_creator_nft, 1)

  let tx =
    Transaction {
      ..placeholder,
      inputs: [utxo_ref_input],
      outputs: [depositor_output],
      reference_inputs: [gs_input],
      mint: mint,
      extra_signatories: [market_creator_vkh],
    }

  market_validator.mint(
    deposit_validator_hash_t,
    global_settings_validator_hash_t,
    utxo_ref_t,
    CreateMarket(10_000, 5_000, 5_000),
    market_validator_pid_t,
    tx,
  )
}

test test_close_market() {
  let mint = from_asset(market_validator_pid_t, market_creator_nft, -1)

  let tx = Transaction { ..placeholder, mint: mint }

  market_validator.mint(
    deposit_validator_hash_t,
    global_settings_validator_hash_t,
    utxo_ref_t,
    CloseMarket,
    market_validator_pid_t,
    tx,
  )
}

test test_yes_market_buy() {
  let mint = from_asset(market_validator_pid_t, yes_token_name, 1000)

  let tx = Transaction { ..placeholder, mint: mint }

  market_validator.mint(
    deposit_validator_hash_t,
    global_settings_validator_hash_t,
    utxo_ref_t,
    YesMarket { amount: 100, user_addr: mock_pub_key_address(11, None) },
    market_validator_pid_t,
    tx,
  )
}

test test_no_market_buy() {
  let mint = from_asset(market_validator_pid_t, no_token_name, 1000)

  let tx = Transaction { ..placeholder, mint: mint }

  market_validator.mint(
    deposit_validator_hash_t,
    global_settings_validator_hash_t,
    utxo_ref_t,
    NoMarket { amount: 100, user_addr: mock_pub_key_address(11, None) },
    market_validator_pid_t,
    tx,
  )
}

test test_redeem_market() {
  let mint = from_asset(market_validator_pid_t, no_token_name, -1000)

  let tx = Transaction { ..placeholder, mint: mint }

  market_validator.mint(
    deposit_validator_hash_t,
    global_settings_validator_hash_t,
    utxo_ref_t,
    Redeem { amount: 1000, user_addr: mock_pub_key_address(11, None) },
    market_validator_pid_t,
    tx,
  )
}
