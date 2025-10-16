use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{ScriptHash, VerificationKeyHash}
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{Value, from_asset, from_lovelace, quantity_of}
use cardano/transaction.{
  InlineDatum, Input, NoDatum, Output, OutputReference, Transaction,
  ValidityRange, find_input, placeholder,
}
use cocktail/vodka_extra_signatories.{key_signed}
use cocktail/vodka_validity_range.{valid_after}
use foreon/constants.{
  global_settings_nft, market_creator_nft, no_token_name, precision_factor,
  yes_token_name,
}
use foreon/types.{
  AssetType, CloseMarket, GlobalSettingsDatum, MarketDatum, MarketExecution,
  NoMarket, NoMarketSell, NoSide, Redeem, StartingP, StartingQ, UpdateWinner,
  YesMarket, YesMarketSell, YesSide,
}
use foreon/utils.{
  get_global_settings, get_user_asset_amt_in_out, is_multisig_signing,
}
use mocktail/virgin_address.{mock_pub_key_address}
use mocktail/virgin_key_hash.{mock_pub_key_hash, mock_script_hash}
use mocktail/virgin_output_reference.{mock_utxo_ref}
use mocktail/virgin_validity_range.{mock_interval}
use test_utils/constants_t.{
  admin_t, deposit_validator_hash_t, global_settings_validator_hash_t,
  market_validator_pid_t,
}

validator deposit_validator(global_settings_hash: ScriptHash) {
  spend(
    datum: Option<MarketDatum>,
    redeemer: MarketExecution,
    utxo: OutputReference,
    self: Transaction,
  ) {
    let Transaction {
      extra_signatories,
      validity_range,
      inputs,
      outputs,
      mint,
      reference_inputs,
      ..
    } = self
    when redeemer is {
      CloseMarket ->
        handle_close_market(
          datum,
          extra_signatories,
          inputs,
          outputs,
          validity_range,
          utxo,
          mint,
        )
      YesMarket { amount, user_addr } ->
        handle_yes_market_buy(
          amount,
          user_addr,
          datum,
          extra_signatories,
          inputs,
          outputs,
          utxo,
        )
      NoMarket { amount, user_addr } ->
        handle_no_market_buy(
          amount,
          user_addr,
          datum,
          extra_signatories,
          inputs,
          outputs,
          utxo,
        )
      UpdateWinner ->
        handle_update_winner(
          global_settings_hash,
          reference_inputs,
          inputs,
          datum,
          outputs,
          utxo,
        )
      Redeem { amount, user_addr } ->
        handle_redeem(
          amount,
          user_addr,
          datum,
          inputs,
          outputs,
          utxo,
          mint,
          validity_range,
        )
      YesMarketSell { amount, user_addr } ->
        handle_yes_market_sell(
          amount,
          user_addr,
          datum,
          inputs,
          outputs,
          utxo,
          mint,
          extra_signatories,
        )
      NoMarketSell { amount, user_addr } ->
        handle_no_market_sell(
          amount,
          user_addr,
          datum,
          inputs,
          outputs,
          utxo,
          mint,
          extra_signatories,
        )
      _ -> False
    }
  }

  else(_) {
    fail
  }
}

fn handle_close_market(
  datum: Option<MarketDatum>,
  extra_signatories: List<VerificationKeyHash>,
  inputs: List<Input>,
  outputs: List<Output>,
  validity_range: ValidityRange,
  utxo: OutputReference,
  mint: Value,
) {
  // Get deposit (market utxo) and extract the deposit validator hash
  expect Some(deposit_validator_input) = find_input(inputs, utxo)
  expect Script(deposit_validator_hash) =
    deposit_validator_input.output.address.payment_credential

  expect Some(MarketDatum {
    market_creator_address,
    market_validator_hash,
    end_date,
    starting_q,
    q_yes,
    q_no,
    winner,
    ..
  }) = datum

  let Address { payment_credential: mc_payment_credential, .. } =
    market_creator_address
  expect VerificationKey(mc_verification_key_hash) = mc_payment_credential

  // There should be no market utxo output
  expect None =
    list.find(
      outputs,
      fn(output) {
        output.address.payment_credential == Script(deposit_validator_hash)
      },
    )

  // Market utxo value must go to the market creator
  // expect Some(_) =
  //   list.find(
  //     outputs,
  //     fn(output) {
  //       and {
  //         (output.address == market_creator_address)?,
  //         (output.value == assets.add(
  //           deposit_validator_input.output.value,
  //           market_validator_hash,
  //           market_creator_nft,
  //           -1,
  //         ))?,
  //       }
  //     },
  //   )
  expect Some(_) =
    list.find(
      outputs,
      fn(output) {
        and {
          output.address == market_creator_address,
          output.value == assets.add(
            deposit_validator_input.output.value,
            market_validator_hash,
            market_creator_nft,
            -1,
          ),
        }
      },
    )

  // Must burn creator NFT
  expect [Pair(_, nft_quantity)] =
    mint |> assets.tokens(market_validator_hash) |> dict.to_pairs()

  // Winner must have been decided
  expect Some(_) = winner

  // The current quantity of shares must be same as the starting quantity
  let StartingQ { q_yes: starting_q_yes, q_no: starting_q_no } = starting_q
  // let q_shares_valid = and {
  //     (q_yes == starting_q_yes)?,
  //     (q_no == starting_q_no)?,
  //   }
  let q_shares_valid = and {
      q_yes == starting_q_yes,
      q_no == starting_q_no,
    }

  // and {
  //   key_signed(extra_signatories, mc_verification_key_hash)?,
  //   valid_after(validity_range, end_date)?,
  //   (nft_quantity == -1)?,
  //   q_shares_valid?,
  // }
  and {
    key_signed(extra_signatories, mc_verification_key_hash),
    valid_after(validity_range, end_date),
    nft_quantity == -1,
    q_shares_valid,
  }
}

fn handle_yes_market_buy(
  amount: Int,
  user_addr: Address,
  datum: Option<MarketDatum>,
  extra_signatories: List<VerificationKeyHash>,
  inputs: List<Input>,
  outputs: List<Output>,
  utxo: OutputReference,
) {
  expect Some(MarketDatum {
    market_creator_address,
    market_validator_hash,
    market_token,
    end_date,
    starting_q,
    starting_p,
    q,
    q_yes,
    q_no,
    p_yes,
    winner,
    ..
  }) = datum

  let AssetType {
    policy_id: mt_policy_id,
    asset_name: mt_asset_name,
    multiplier,
    ..
  } = market_token

  let share_price = p_yes

  let token_name = yes_token_name

  expect VerificationKey(user_vkh) = user_addr.payment_credential

  expect Some(deposit_validator_input) = find_input(inputs, utxo)

  // Find a deposit validator (market utxo) output, makes sure there's only one output
  expect [deposit_validator_output] =
    list.filter(
      outputs,
      fn(output) { output.address == deposit_validator_input.output.address },
    )

  let prev_market_value =
    quantity_of(
      deposit_validator_input.output.value,
      mt_policy_id,
      mt_asset_name,
    )
  let new_market_value =
    quantity_of(deposit_validator_output.value, mt_policy_id, mt_asset_name)

  let user_added_value_precised = share_price * amount * multiplier
  let user_added_value = user_added_value_precised / precision_factor
  let expected_new_mv = prev_market_value + user_added_value

  let new_q = q + amount
  let new_q_yes = q_yes + amount

  let new_p_yes_num = new_q_yes * precision_factor
  let new_p_yes = new_p_yes_num / new_q
  let p_no_num = q_no * precision_factor
  let new_p_no = p_no_num / new_q

  // Get and verify datum of deposit (market utxo output)
  expect InlineDatum(datum_data) = deposit_validator_output.datum
  expect MarketDatum {
    market_creator_address: market_creator_address_o,
    market_validator_hash: market_validator_hash_o,
    market_token: market_token_o,
    end_date: end_date_o,
    starting_q: starting_q_o,
    starting_p: starting_p_o,
    q: q_o,
    q_yes: q_yes_o,
    q_no: q_no_o,
    p_yes: p_yes_o,
    p_no: p_no_o,
    winner: winner_o,
  } = datum_data
  // let market_datum_is_valid = and {
  //     // unchanged
  //     (market_creator_address == market_creator_address_o)?,
  //     (market_validator_hash == market_validator_hash_o)?,
  //     (market_token == market_token_o)?,
  //     (end_date == end_date_o)?,
  //     (starting_q == starting_q_o)?,
  //     (starting_p == starting_p_o)?,
  //     (q_no == q_no_o)?,
  //     (p_no == p_no_o)?,
  //     (winner == winner_o)?,
  //     // changed
  //     (q_o == new_q)?,
  //     (q_yes_o == new_q_yes)?,
  //     (p_yes_o == new_p_yes)?,
  //   }
  let market_datum_is_valid = and {
      // unchanged
      market_creator_address == market_creator_address_o,
      market_validator_hash == market_validator_hash_o,
      market_token == market_token_o,
      end_date == end_date_o,
      starting_q == starting_q_o,
      starting_p == starting_p_o,
      q_no == q_no_o,
      winner == winner_o,
      // changed
      q_o == new_q,
      q_yes_o == new_q_yes,
      p_yes_o == new_p_yes,
      p_no_o == new_p_no,
    }

  and {
    // user signs the transaction
    key_signed(extra_signatories, user_vkh)?,
    // amount of token/share goes to user
    (list.count(
      outputs,
      fn(output) {
        and {
          output.address == user_addr,
          quantity_of(output.value, market_validator_hash, token_name) == amount,
        }
      },
    ) == 1)?,
    // The new market value must be the same as the expected new market value
    (new_market_value == expected_new_mv)?,
    // Is market datum output valid
    market_datum_is_valid?,
  }
}

fn handle_no_market_buy(
  amount: Int,
  user_addr: Address,
  datum: Option<MarketDatum>,
  extra_signatories: List<VerificationKeyHash>,
  inputs: List<Input>,
  outputs: List<Output>,
  utxo: OutputReference,
) {
  expect Some(MarketDatum {
    market_creator_address,
    market_validator_hash,
    market_token,
    end_date,
    starting_q,
    starting_p,
    q,
    q_yes,
    q_no,
    p_no,
    winner,
    ..
  }) = datum

  let AssetType {
    policy_id: mt_policy_id,
    asset_name: mt_asset_name,
    multiplier,
    ..
  } = market_token

  let share_price = p_no

  let token_name = no_token_name

  expect VerificationKey(user_vkh) = user_addr.payment_credential

  expect Some(deposit_validator_input) = find_input(inputs, utxo)

  // Find a deposit validator (market utxo) output, makes sure there's only one output
  expect [deposit_validator_output] =
    list.filter(
      outputs,
      fn(output) { output.address == deposit_validator_input.output.address },
    )

  let prev_market_value =
    quantity_of(
      deposit_validator_input.output.value,
      mt_policy_id,
      mt_asset_name,
    )
  let new_market_value =
    quantity_of(deposit_validator_output.value, mt_policy_id, mt_asset_name)

  let user_added_value_precised = share_price * amount * multiplier
  let user_added_value = user_added_value_precised / precision_factor
  let expected_new_mv = prev_market_value + user_added_value

  let new_q = q + amount
  let new_q_no = q_no + amount

  let new_p_no_num = new_q_no * precision_factor
  let new_p_no = new_p_no_num / new_q

  let p_yes_num = q_yes * precision_factor
  let new_p_yes = p_yes_num / new_q

  // Get and verify datum of deposit (market utxo output)
  expect InlineDatum(datum_data) = deposit_validator_output.datum
  expect MarketDatum {
    market_creator_address: market_creator_address_o,
    market_validator_hash: market_validator_hash_o,
    market_token: market_token_o,
    end_date: end_date_o,
    starting_q: starting_q_o,
    starting_p: starting_p_o,
    q: q_o,
    q_yes: q_yes_o,
    q_no: q_no_o,
    p_yes: p_yes_o,
    p_no: p_no_o,
    winner: winner_o,
  } = datum_data
  // let market_datum_is_valid = and {
  //     // unchanged
  //     (market_creator_address == market_creator_address_o)?,
  //     (market_validator_hash == market_validator_hash_o)?,
  //     (market_token == market_token_o)?,
  //     (end_date == end_date_o)?,
  //     (starting_q == starting_q_o)?,
  //     (starting_p == starting_p_o)?,
  //     (q_yes == q_yes_o)?,
  //     (p_yes == p_yes_o)?,
  //     (winner == winner_o)?,
  //     // changed
  //     (q_o == new_q)?,
  //     (q_no_o == new_q_no)?,
  //     (p_no_o == new_p_no)?,
  //   }
  let market_datum_is_valid = and {
      // unchanged
      market_creator_address == market_creator_address_o,
      market_validator_hash == market_validator_hash_o,
      market_token == market_token_o,
      end_date == end_date_o,
      starting_q == starting_q_o,
      starting_p == starting_p_o,
      q_yes == q_yes_o,
      winner == winner_o,
      // changed
      q_o == new_q,
      q_no_o == new_q_no,
      p_no_o == new_p_no,
      p_yes_o == new_p_yes,
    }

  and {
    // user signs the transaction
    key_signed(extra_signatories, user_vkh)?,
    // amount of token/share goes to user
    (list.count(
      outputs,
      fn(output) {
        and {
          output.address == user_addr,
          quantity_of(output.value, market_validator_hash, token_name) == amount,
        }
      },
    ) == 1)?,
    // The new market value must be the same as the expected new market value
    (new_market_value == expected_new_mv)?,
    // Is market datum output valid
    market_datum_is_valid?,
  }
}

fn handle_update_winner(
  global_settings_hash: ScriptHash,
  ref_inputs: List<Input>,
  inputs: List<Input>,
  datum: Option<MarketDatum>,
  outputs: List<Output>,
  utxo: OutputReference,
) {
  let global_settings_datum =
    get_global_settings(global_settings_hash, ref_inputs)
  expect GlobalSettingsDatum { admin, .. } = global_settings_datum

  expect Some(MarketDatum {
    market_creator_address,
    market_validator_hash,
    market_token,
    end_date,
    starting_q,
    starting_p,
    q,
    q_yes,
    q_no,
    p_yes,
    p_no,
    winner,
  }) = datum

  expect Some(deposit_validator_input) = find_input(inputs, utxo)
  expect [deposit_validator_output] =
    list.filter(
      outputs,
      fn(output) { output.address == deposit_validator_input.output.address },
    )

  expect InlineDatum(datum_data) = deposit_validator_output.datum
  expect MarketDatum {
    market_creator_address: market_creator_address_o,
    market_validator_hash: market_validator_hash_o,
    market_token: market_token_o,
    end_date: end_date_o,
    starting_q: starting_q_o,
    starting_p: starting_p_o,
    q: q_o,
    q_yes: q_yes_o,
    q_no: q_no_o,
    p_yes: p_yes_o,
    p_no: p_no_o,
    winner: winner_o,
  } = datum_data

  // let market_datum_is_valid = and {
  //     // unchanged
  //     (market_creator_address == market_creator_address_o)?,
  //     (market_validator_hash == market_validator_hash_o)?,
  //     (market_token == market_token_o)?,
  //     (end_date == end_date_o)?,
  //     (starting_q == starting_q_o)?,
  //     (starting_p == starting_p_o)?,
  //     (q == q_o)?,
  //     (q_yes == q_yes_o)?,
  //     (p_yes == p_yes_o)?,
  //     (q_no == q_no_o)?,
  //     (p_no == p_no_o)?,
  //     // changed
  //     (winner != winner_o)?,
  //   }
  let market_datum_is_valid = and {
      // unchanged
      market_creator_address == market_creator_address_o,
      market_validator_hash == market_validator_hash_o,
      market_token == market_token_o,
      end_date == end_date_o,
      starting_q == starting_q_o,
      starting_p == starting_p_o,
      q == q_o,
      q_yes == q_yes_o,
      p_yes == p_yes_o,
      q_no == q_no_o,
      p_no == p_no_o,
      // changed
      winner != winner_o,
    }

  // and {
  //   // admin must sign the transaction
  //   is_multisig_signing(inputs, admin)?,
  //   // Is market datum output valid
  //   market_datum_is_valid?,
  //   // deposit utxo value must not change
  //   (deposit_validator_input.output.value == deposit_validator_output.value)?,
  // }
  and {
    // admin must sign the transaction
    is_multisig_signing(inputs, admin),
    // Is market datum output valid
    market_datum_is_valid,
    // deposit utxo value must not change
    deposit_validator_input.output.value == deposit_validator_output.value,
  }
}

fn handle_redeem(
  amount: Int,
  user_addr: Address,
  datum: Option<MarketDatum>,
  inputs: List<Input>,
  outputs: List<Output>,
  utxo: OutputReference,
  mint: Value,
  validity_range: ValidityRange,
) {
  // Get deposit (market utxo) and extract the deposit validator hash
  expect Some(deposit_validator_input) = find_input(inputs, utxo)

  expect Some(MarketDatum {
    market_validator_hash,
    market_token,
    winner,
    end_date,
    ..
  }) = datum
  // Winner must have been decided
  expect Some(winner_type) = winner
  // market token
  let AssetType {
    policy_id: mt_policy_id,
    asset_name: mt_asset_name,
    multiplier,
    ..
  } = market_token

  let winning_token =
    when winner_type is {
      YesSide -> yes_token_name
      NoSide -> no_token_name
    }

  let actual_amount = amount * multiplier

  // Find a deposit validator (market utxo) output, makes sure there's only one output
  expect [deposit_validator_output] =
    list.filter(
      outputs,
      fn(output) { output.address == deposit_validator_input.output.address },
    )

  expect VerificationKey(user_vkh) = user_addr.payment_credential
  // Get user amount in and out the winning token
  let (wt_amt_in, wt_amt_out) =
    get_user_asset_amt_in_out(
      inputs,
      outputs,
      user_vkh,
      market_validator_hash,
      winning_token,
    )
  // Get user amount in and out the market token
  let (mt_amt_in, mt_amt_out) =
    get_user_asset_amt_in_out(
      inputs,
      outputs,
      user_vkh,
      mt_policy_id,
      mt_asset_name,
    )

  let is_deposit_value_valid =
    quantity_of(
      deposit_validator_input.output.value,
      mt_policy_id,
      mt_asset_name,
    ) - actual_amount == quantity_of(
      deposit_validator_output.value,
      mt_policy_id,
      mt_asset_name,
    )

  expect [Pair(mint_aname, mint_q)] =
    mint |> assets.tokens(market_validator_hash) |> dict.to_pairs
  // let is_mint_valid = and {
  //     (mint_aname == winning_token)?,
  //     (mint_q == -amount)?,
  //   }
  let is_mint_valid = and {
      mint_aname == winning_token,
      mint_q == -amount,
    }

  // and {
  //   // event must have ended
  //   valid_after(validity_range, end_date)?,
  //   // market utxo datum must not change
  //   (deposit_validator_input.output.datum == deposit_validator_output.datum)?,
  //   // user must provide `amount` of winning token
  //   (wt_amt_in - amount == wt_amt_out)?,
  //   // user must get market token (USDM) in a 1:1 ratio
  //   (mt_amt_in + actual_amount == mt_amt_out)?,
  //   is_deposit_value_valid?,
  //   is_mint_valid?,
  // }
  and {
    // event must have ended
    valid_after(validity_range, end_date),
    // market utxo datum must not change
    deposit_validator_input.output.datum == deposit_validator_output.datum,
    // user must provide `amount` of winning token
    wt_amt_in - amount == wt_amt_out,
    // user must get market token (USDM) in a 1:1 ratio
    mt_amt_in + actual_amount == mt_amt_out,
    is_deposit_value_valid,
    is_mint_valid,
  }
}

fn handle_yes_market_sell(
  amount: Int,
  user_addr: Address,
  datum: Option<MarketDatum>,
  inputs: List<Input>,
  outputs: List<Output>,
  utxo: OutputReference,
  mint: Value,
  extra_signatories: List<VerificationKeyHash>,
) {
  // Get deposit (market utxo) and extract the deposit validator hash
  expect Some(deposit_validator_input) = find_input(inputs, utxo)

  expect Some(MarketDatum {
    market_creator_address,
    market_validator_hash,
    market_token,
    end_date,
    starting_q,
    starting_p,
    q,
    q_yes,
    q_no,
    p_yes,
    winner,
    ..
  }) = datum

  // market token
  let AssetType {
    policy_id: mt_policy_id,
    asset_name: mt_asset_name,
    multiplier,
    ..
  } = market_token

  let sell_token = yes_token_name
  let share_price = p_yes

  let actual_amount = amount * multiplier

  // Find a deposit validator (market utxo) output, makes sure there's only one output
  expect [deposit_validator_output] =
    list.filter(
      outputs,
      fn(output) { output.address == deposit_validator_input.output.address },
    )

  expect VerificationKey(user_vkh) = user_addr.payment_credential
  // Get user amount in and out the winning token
  let (st_amt_in, st_amt_out) =
    get_user_asset_amt_in_out(
      inputs,
      outputs,
      user_vkh,
      market_validator_hash,
      sell_token,
    )
  // Get user amount in and out the market token
  let (mt_amt_in, mt_amt_out) =
    get_user_asset_amt_in_out(
      inputs,
      outputs,
      user_vkh,
      mt_policy_id,
      mt_asset_name,
    )

  expect [Pair(mint_aname, mint_q)] =
    mint |> assets.tokens(market_validator_hash) |> dict.to_pairs
  // let is_mint_valid = and {
  //     (mint_aname == sell_token)?,
  //     (mint_q == -amount)?,
  //   }
  let is_mint_valid = and {
      mint_aname == sell_token,
      mint_q == -amount,
    }

  let prev_market_value =
    quantity_of(
      deposit_validator_input.output.value,
      mt_policy_id,
      mt_asset_name,
    )
  let new_market_value =
    quantity_of(deposit_validator_output.value, mt_policy_id, mt_asset_name)

  let user_reduce_value_precised = share_price * actual_amount
  let user_reduce_value = user_reduce_value_precised / precision_factor
  let expected_new_mv = prev_market_value - user_reduce_value

  let new_q = q - amount
  let new_q_yes = q_yes - amount

  let new_p_yes_num = new_q_yes * precision_factor
  let new_p_yes = new_p_yes_num / new_q

  let p_no_num = q_no * precision_factor
  let new_p_no = p_no_num / new_q

  // Get and verify datum of deposit (market utxo output)
  expect InlineDatum(datum_data) = deposit_validator_output.datum
  expect MarketDatum {
    market_creator_address: market_creator_address_o,
    market_validator_hash: market_validator_hash_o,
    market_token: market_token_o,
    end_date: end_date_o,
    starting_q: starting_q_o,
    starting_p: starting_p_o,
    q: q_o,
    q_yes: q_yes_o,
    q_no: q_no_o,
    p_yes: p_yes_o,
    p_no: p_no_o,
    winner: winner_o,
  } = datum_data
  // let market_datum_is_valid = and {
  //     // unchanged
  //     (market_creator_address == market_creator_address_o)?,
  //     (market_validator_hash == market_validator_hash_o)?,
  //     (market_token == market_token_o)?,
  //     (end_date == end_date_o)?,
  //     (starting_q == starting_q_o)?,
  //     (starting_p == starting_p_o)?,
  //     (q_no == q_no_o)?,
  //     (p_no == p_no_o)?,
  //     (winner == winner_o)?,
  //     // changed
  //     (q_o == new_q)?,
  //     (q_yes_o == new_q_yes)?,
  //     (p_yes_o == new_p_yes)?,
  let market_datum_is_valid = and {
      // unchanged
      market_creator_address == market_creator_address_o,
      market_validator_hash == market_validator_hash_o,
      market_token == market_token_o,
      end_date == end_date_o,
      starting_q == starting_q_o,
      starting_p == starting_p_o,
      q_no == q_no_o,
      winner == winner_o,
      // changed
      q_o == new_q,
      q_yes_o == new_q_yes,
      p_yes_o == new_p_yes,
      p_no_o == new_p_no,
    }

  and {
    // user signs the transaction
    key_signed(extra_signatories, user_vkh)?,
    // user must provide `amount` of winning token
    (st_amt_in - amount == st_amt_out)?,
    // user must get market token (USDM) in the current price
    (mt_amt_in + user_reduce_value == mt_amt_out)?,
    is_mint_valid?,
    // The new market value must be the same as the expected new market value
    (new_market_value == expected_new_mv)?,
    market_datum_is_valid?,
  }
}

fn handle_no_market_sell(
  amount: Int,
  user_addr: Address,
  datum: Option<MarketDatum>,
  inputs: List<Input>,
  outputs: List<Output>,
  utxo: OutputReference,
  mint: Value,
  extra_signatories: List<VerificationKeyHash>,
) {
  // Get deposit (market utxo) and extract the deposit validator hash
  expect Some(deposit_validator_input) = find_input(inputs, utxo)

  expect Some(MarketDatum {
    market_creator_address,
    market_validator_hash,
    market_token,
    end_date,
    starting_q,
    starting_p,
    q,
    q_yes,
    q_no,
    p_no,
    winner,
    ..
  }) = datum

  // market token
  let AssetType {
    policy_id: mt_policy_id,
    asset_name: mt_asset_name,
    multiplier,
    ..
  } = market_token

  let sell_token = no_token_name
  let share_price = p_no

  let actual_amount = amount * multiplier

  // Find a deposit validator (market utxo) output, makes sure there's only one output
  expect [deposit_validator_output] =
    list.filter(
      outputs,
      fn(output) { output.address == deposit_validator_input.output.address },
    )

  expect VerificationKey(user_vkh) = user_addr.payment_credential
  // Get user amount in and out the winning token
  let (st_amt_in, st_amt_out) =
    get_user_asset_amt_in_out(
      inputs,
      outputs,
      user_vkh,
      market_validator_hash,
      sell_token,
    )
  // Get user amount in and out the market token
  let (mt_amt_in, mt_amt_out) =
    get_user_asset_amt_in_out(
      inputs,
      outputs,
      user_vkh,
      mt_policy_id,
      mt_asset_name,
    )

  expect [Pair(mint_aname, mint_q)] =
    mint |> assets.tokens(market_validator_hash) |> dict.to_pairs
  // let is_mint_valid = and {
  //     (mint_aname == sell_token)?,
  //     (mint_q == -amount)?,
  //   }
  let is_mint_valid = and {
      mint_aname == sell_token,
      mint_q == -amount,
    }

  let prev_market_value =
    quantity_of(
      deposit_validator_input.output.value,
      mt_policy_id,
      mt_asset_name,
    )
  let new_market_value =
    quantity_of(deposit_validator_output.value, mt_policy_id, mt_asset_name)

  let user_reduce_value_precised = share_price * actual_amount
  let user_reduce_value = user_reduce_value_precised / precision_factor
  let expected_new_mv = prev_market_value - user_reduce_value

  let new_q = q - amount
  let new_q_no = q_no - amount

  let new_p_no_num = new_q_no * precision_factor
  let new_p_no = new_p_no_num / new_q

  let p_yes_num = q_yes * precision_factor
  let new_p_yes = p_yes_num / new_q

  // Get and verify datum of deposit (market utxo output)
  expect InlineDatum(datum_data) = deposit_validator_output.datum
  expect MarketDatum {
    market_creator_address: market_creator_address_o,
    market_validator_hash: market_validator_hash_o,
    market_token: market_token_o,
    end_date: end_date_o,
    starting_q: starting_q_o,
    starting_p: starting_p_o,
    q: q_o,
    q_yes: q_yes_o,
    q_no: q_no_o,
    p_yes: p_yes_o,
    p_no: p_no_o,
    winner: winner_o,
  } = datum_data
  // let market_datum_is_valid = and {
  //     // unchanged
  //     (market_creator_address == market_creator_address_o)?,
  //     (market_validator_hash == market_validator_hash_o)?,
  //     (market_token == market_token_o)?,
  //     (end_date == end_date_o)?,
  //     (starting_q == starting_q_o)?,
  //     (starting_p == starting_p_o)?,
  //     (q_yes == q_yes_o)?,
  //     (p_yes == p_yes_o)?,
  //     (winner == winner_o)?,
  //     // changed
  //     (q_o == new_q)?,
  //     (q_no_o == new_q_no)?,
  //     (p_no_o == new_p_no)?,
  //   }
  let market_datum_is_valid = and {
      // unchanged
      market_creator_address == market_creator_address_o,
      market_validator_hash == market_validator_hash_o,
      market_token == market_token_o,
      end_date == end_date_o,
      starting_q == starting_q_o,
      starting_p == starting_p_o,
      q_yes == q_yes_o,
      winner == winner_o,
      // changed
      q_o == new_q,
      q_no_o == new_q_no,
      p_no_o == new_p_no,
      p_yes_o == new_p_yes,
    }

  and {
    // user signs the transaction
    key_signed(extra_signatories, user_vkh)?,
    // user must provide `amount` of winning token
    (st_amt_in - amount == st_amt_out)?,
    // user must get market token (USDM) in the current price
    (mt_amt_in + user_reduce_value == mt_amt_out)?,
    is_mint_valid?,
    // The new market value must be the same as the expected new market value
    (new_market_value == expected_new_mv)?,
    market_datum_is_valid?,
  }
}

// Tests
test test_close_market() {
  let market_creator_address = mock_pub_key_address(0, None)
  let market_creator_pkh = mock_pub_key_hash(0)

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
  let t_usd_amount = 10_000 * multiplier

  let deposit_input_ref = mock_utxo_ref(1, 11)
  let market_datum =
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
      winner: Some(YesSide),
    }
  let deposit_input =
    Input {
      output_reference: deposit_input_ref,
      output: Output {
        address: Address {
          payment_credential: Script(deposit_validator_hash_t),
          stake_credential: None,
        },
        value: assets.merge(
          from_lovelace(2_000_000),
          from_asset(t_usdc_pid, t_usdc_an, t_usd_amount),
        )
          |> assets.add(market_validator_pid_t, market_creator_nft, 1),
        datum: InlineDatum(market_datum),
        reference_script: None,
      },
    }

  let mc_output =
    Output {
      address: market_creator_address,
      value: assets.merge(
        from_lovelace(2_000_000),
        from_asset(t_usdc_pid, t_usdc_an, t_usd_amount),
      ),
      datum: NoDatum,
      reference_script: None,
    }

  let mint = from_asset(market_validator_pid_t, market_creator_nft, -1)

  let validity_range = mock_interval(Some(1758494411), Some(1758596411))

  let tx =
    Transaction {
      ..placeholder,
      inputs: [deposit_input],
      outputs: [mc_output],
      mint: mint,
      validity_range: validity_range,
      extra_signatories: [market_creator_pkh],
    }

  deposit_validator.spend(
    global_settings_validator_hash_t,
    Some(market_datum),
    CloseMarket,
    deposit_input_ref,
    tx,
  )
}

test test_yes_market_buy() {
  let user_addr = mock_pub_key_address(11, None)
  let user_vkh = mock_pub_key_hash(11)
  let yes_amount = 100

  let q = 10_000
  let p_yes = 5_000
  let q_yes = 5_000
  let q_no = 5_000

  let new_q = q + yes_amount
  let new_q_yes = q_yes + yes_amount

  let new_p_yes_num = new_q_yes * precision_factor
  let new_p_yes = new_p_yes_num / new_q
  let p_no_num = q_no * precision_factor
  let new_p_no = p_no_num / new_q

  let market_creator_address = mock_pub_key_address(0, None)

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
  let t_usd_amount = 10_000 * multiplier

  let deposit_input_ref = mock_utxo_ref(1, 11)
  let market_datum =
    MarketDatum {
      market_creator_address,
      market_validator_hash: market_validator_pid_t,
      market_token: m_asset,
      end_date: 1758493411,
      starting_q: StartingQ { q_yes: 5_000, q_no: 5_000 },
      starting_p: StartingP { p_yes: 5_000, p_no: 5_000 },
      q,
      q_yes,
      q_no,
      p_yes,
      p_no: 5_000,
      winner: None,
    }
  let deposit_input =
    Input {
      output_reference: deposit_input_ref,
      output: Output {
        address: Address {
          payment_credential: Script(deposit_validator_hash_t),
          stake_credential: None,
        },
        value: assets.merge(
          from_lovelace(2_000_000),
          from_asset(t_usdc_pid, t_usdc_an, t_usd_amount),
        )
          |> assets.add(market_validator_pid_t, market_creator_nft, 1),
        datum: InlineDatum(market_datum),
        reference_script: None,
      },
    }

  let user_added_value_precised = p_yes * yes_amount * multiplier
  let user_added_value = user_added_value_precised / precision_factor
  let new_t_usd_amount = t_usd_amount + user_added_value
  let deposit_output =
    Output {
      address: Address {
        payment_credential: Script(deposit_validator_hash_t),
        stake_credential: None,
      },
      value: assets.merge(
        from_lovelace(2_000_000),
        from_asset(t_usdc_pid, t_usdc_an, new_t_usd_amount),
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
          q: new_q,
          q_yes: new_q_yes,
          q_no,
          p_yes: new_p_yes,
          p_no: new_p_no,
          winner: None,
        },
      ),
      reference_script: None,
    }

  trace @"new_q": new_q
  trace @"new_q_yes": new_q_yes
  trace @"new_p_yes": new_p_yes

  let user_output =
    Output {
      address: user_addr,
      value: assets.merge(
        from_lovelace(2_000_000),
        from_asset(market_validator_pid_t, yes_token_name, yes_amount),
      ),
      datum: NoDatum,
      reference_script: None,
    }

  let tx =
    Transaction {
      ..placeholder,
      inputs: [deposit_input],
      outputs: [deposit_output, user_output],
      extra_signatories: [user_vkh],
    }

  deposit_validator.spend(
    global_settings_validator_hash_t,
    Some(market_datum),
    YesMarket(yes_amount, user_addr),
    deposit_input_ref,
    tx,
  )
}

test test_no_market_buy() {
  let user_addr = mock_pub_key_address(11, None)
  let user_vkh = mock_pub_key_hash(11)
  let no_amount = 400

  let q = 10_000
  let p_no = 5_000
  let q_no = 5_000
  let q_yes = 5_000

  let new_q = q + no_amount
  let new_q_no = q_no + no_amount

  let new_p_no_num = new_q_no * precision_factor
  let new_p_no = new_p_no_num / new_q
  let p_yes_num = q_yes * precision_factor
  let new_p_yes = p_yes_num / new_q

  let market_creator_address = mock_pub_key_address(0, None)

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
  let t_usd_amount = 10_000 * multiplier

  let deposit_input_ref = mock_utxo_ref(1, 11)
  let market_datum =
    MarketDatum {
      market_creator_address,
      market_validator_hash: market_validator_pid_t,
      market_token: m_asset,
      end_date: 1758493411,
      starting_q: StartingQ { q_yes: 5_000, q_no: 5_000 },
      starting_p: StartingP { p_yes: 5_000, p_no: 5_000 },
      q,
      q_yes,
      q_no,
      p_yes: 5_000,
      p_no,
      winner: None,
    }
  let deposit_input =
    Input {
      output_reference: deposit_input_ref,
      output: Output {
        address: Address {
          payment_credential: Script(deposit_validator_hash_t),
          stake_credential: None,
        },
        value: assets.merge(
          from_lovelace(2_000_000),
          from_asset(t_usdc_pid, t_usdc_an, t_usd_amount),
        )
          |> assets.add(market_validator_pid_t, market_creator_nft, 1),
        datum: InlineDatum(market_datum),
        reference_script: None,
      },
    }

  let user_added_value_precised = p_no * no_amount * multiplier
  let user_added_value = user_added_value_precised / precision_factor
  let new_t_usd_amount = t_usd_amount + user_added_value
  let deposit_output =
    Output {
      address: Address {
        payment_credential: Script(deposit_validator_hash_t),
        stake_credential: None,
      },
      value: assets.merge(
        from_lovelace(2_000_000),
        from_asset(t_usdc_pid, t_usdc_an, new_t_usd_amount),
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
          q: new_q,
          q_yes: 5_000,
          q_no: new_q_no,
          p_yes: new_p_yes,
          p_no: new_p_no,
          winner: None,
        },
      ),
      reference_script: None,
    }

  let user_output =
    Output {
      address: user_addr,
      value: assets.merge(
        from_lovelace(2_000_000),
        from_asset(market_validator_pid_t, no_token_name, no_amount),
      ),
      datum: NoDatum,
      reference_script: None,
    }

  let tx =
    Transaction {
      ..placeholder,
      inputs: [deposit_input],
      outputs: [deposit_output, user_output],
      extra_signatories: [user_vkh],
    }

  deposit_validator.spend(
    global_settings_validator_hash_t,
    Some(market_datum),
    NoMarket(no_amount, user_addr),
    deposit_input_ref,
    tx,
  )
}

test test_update_winner() {
  let market_creator_address = mock_pub_key_address(0, None)

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
  let t_usd_amount = 10_000 * multiplier

  let deposit_input_ref = mock_utxo_ref(1, 11)
  let market_datum =
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
    }
  let deposit_input =
    Input {
      output_reference: deposit_input_ref,
      output: Output {
        address: Address {
          payment_credential: Script(deposit_validator_hash_t),
          stake_credential: None,
        },
        value: assets.merge(
          from_lovelace(2_000_000),
          from_asset(t_usdc_pid, t_usdc_an, t_usd_amount),
        )
          |> assets.add(market_validator_pid_t, market_creator_nft, 1),
        datum: InlineDatum(market_datum),
        reference_script: None,
      },
    }

  let deposit_output =
    Output {
      address: Address {
        payment_credential: Script(deposit_validator_hash_t),
        stake_credential: None,
      },
      value: assets.merge(
        from_lovelace(2_000_000),
        from_asset(t_usdc_pid, t_usdc_an, t_usd_amount),
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
          winner: Some(YesSide),
        },
      ),
      reference_script: None,
    }

  let admin_input =
    Input {
      output_reference: mock_utxo_ref(0, 10),
      output: Output {
        address: Address {
          payment_credential: Script(admin_t),
          stake_credential: None,
        },
        value: from_lovelace(2000000),
        datum: NoDatum,
        reference_script: None,
      },
    }

  let gs_input_datum =
    GlobalSettingsDatum {
      admin: admin_t,
      min_market_amount: 10_000,
      allowed_assets: [],
    }
  let gs_input_utxo_ref = mock_utxo_ref(0, 11)
  let gsn = from_asset(global_settings_validator_hash_t, global_settings_nft, 1)
  let gs_input =
    Input {
      output_reference: gs_input_utxo_ref,
      output: Output {
        address: Address {
          payment_credential: Script(global_settings_validator_hash_t),
          stake_credential: None,
        },
        value: assets.merge(from_lovelace(2000000), gsn),
        datum: InlineDatum(gs_input_datum),
        reference_script: None,
      },
    }

  let tx =
    Transaction {
      ..placeholder,
      inputs: [deposit_input, admin_input],
      outputs: [deposit_output],
      reference_inputs: [gs_input],
    }

  deposit_validator.spend(
    global_settings_validator_hash_t,
    Some(market_datum),
    UpdateWinner,
    deposit_input_ref,
    tx,
  )
}

test test_redeem_yes_winner() {
  let user_addr = mock_pub_key_address(11, None)
  let yes_amount = 400

  let market_creator_address = mock_pub_key_address(0, None)

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
  let t_usd_amount = 10_000 * multiplier

  let actual_yes_amount = yes_amount * multiplier

  let deposit_input_ref = mock_utxo_ref(1, 11)
  let market_datum =
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
      winner: Some(YesSide),
    }
  let deposit_input =
    Input {
      output_reference: deposit_input_ref,
      output: Output {
        address: Address {
          payment_credential: Script(deposit_validator_hash_t),
          stake_credential: None,
        },
        value: assets.merge(
          from_lovelace(2_000_000),
          from_asset(t_usdc_pid, t_usdc_an, t_usd_amount),
        )
          |> assets.add(market_validator_pid_t, market_creator_nft, 1),
        datum: InlineDatum(market_datum),
        reference_script: None,
      },
    }

  let deposit_output =
    Output {
      address: Address {
        payment_credential: Script(deposit_validator_hash_t),
        stake_credential: None,
      },
      value: assets.merge(
        from_lovelace(2_000_000),
        from_asset(t_usdc_pid, t_usdc_an, t_usd_amount - actual_yes_amount),
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
          winner: Some(YesSide),
        },
      ),
      reference_script: None,
    }

  let user_input =
    Input {
      output_reference: mock_utxo_ref(0, 10),
      output: Output {
        address: user_addr,
        value: assets.merge(
          from_lovelace(2000000),
          from_asset(t_usdc_pid, t_usdc_an, 500_000_000),
        )
          |> assets.add(market_validator_pid_t, yes_token_name, yes_amount),
        datum: NoDatum,
        reference_script: None,
      },
    }
  let user_output =
    Output {
      address: user_addr,
      value: assets.merge(
        from_lovelace(2000000),
        from_asset(t_usdc_pid, t_usdc_an, 500_000_000 + actual_yes_amount),
      ),
      datum: NoDatum,
      reference_script: None,
    }

  let validity_range = mock_interval(Some(1758494411), Some(1758596411))
  let mint = from_asset(market_validator_pid_t, yes_token_name, -yes_amount)

  let tx =
    Transaction {
      ..placeholder,
      inputs: [deposit_input, user_input],
      outputs: [deposit_output, user_output],
      mint: mint,
      validity_range: validity_range,
    }

  deposit_validator.spend(
    global_settings_validator_hash_t,
    Some(market_datum),
    Redeem(yes_amount, user_addr),
    deposit_input_ref,
    tx,
  )
}

test test_redeem_no_winner() {
  let user_addr = mock_pub_key_address(11, None)
  let no_amount = 400

  let market_creator_address = mock_pub_key_address(0, None)

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
  let t_usd_amount = 10_000 * multiplier

  let actual_no_amount = no_amount * multiplier

  let deposit_input_ref = mock_utxo_ref(1, 11)
  let market_datum =
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
      winner: Some(NoSide),
    }
  let deposit_input =
    Input {
      output_reference: deposit_input_ref,
      output: Output {
        address: Address {
          payment_credential: Script(deposit_validator_hash_t),
          stake_credential: None,
        },
        value: assets.merge(
          from_lovelace(2_000_000),
          from_asset(t_usdc_pid, t_usdc_an, t_usd_amount),
        )
          |> assets.add(market_validator_pid_t, market_creator_nft, 1),
        datum: InlineDatum(market_datum),
        reference_script: None,
      },
    }

  let deposit_output =
    Output {
      address: Address {
        payment_credential: Script(deposit_validator_hash_t),
        stake_credential: None,
      },
      value: assets.merge(
        from_lovelace(2_000_000),
        from_asset(t_usdc_pid, t_usdc_an, t_usd_amount - actual_no_amount),
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
          winner: Some(NoSide),
        },
      ),
      reference_script: None,
    }

  let user_input =
    Input {
      output_reference: mock_utxo_ref(0, 10),
      output: Output {
        address: user_addr,
        value: assets.merge(
          from_lovelace(2000000),
          from_asset(t_usdc_pid, t_usdc_an, 500_000_000),
        )
          |> assets.add(market_validator_pid_t, no_token_name, no_amount),
        datum: NoDatum,
        reference_script: None,
      },
    }
  let user_output =
    Output {
      address: user_addr,
      value: assets.merge(
        from_lovelace(2000000),
        from_asset(t_usdc_pid, t_usdc_an, 500_000_000 + actual_no_amount),
      ),
      datum: NoDatum,
      reference_script: None,
    }

  let validity_range = mock_interval(Some(1758494411), Some(1758596411))
  let mint = from_asset(market_validator_pid_t, no_token_name, -no_amount)

  let tx =
    Transaction {
      ..placeholder,
      inputs: [deposit_input, user_input],
      outputs: [deposit_output, user_output],
      mint: mint,
      validity_range: validity_range,
    }

  deposit_validator.spend(
    global_settings_validator_hash_t,
    Some(market_datum),
    Redeem(no_amount, user_addr),
    deposit_input_ref,
    tx,
  )
}

test test_yes_market_sell() {
  let user_addr = mock_pub_key_address(11, None)
  let user_vkh = mock_pub_key_hash(11)
  let yes_amount = 400

  let token_name = yes_token_name

  let q = 10_000
  let p_yes = 5_000
  let q_yes = 5_000
  let q_no = 5_000

  let new_q = q - yes_amount
  let new_q_yes = q_yes - yes_amount

  let new_p_yes_num = new_q_yes * precision_factor
  let new_p_yes = new_p_yes_num / new_q

  let p_no_num = q_no * precision_factor
  let new_p_no = p_no_num / new_q

  let market_creator_address = mock_pub_key_address(0, None)

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
  let t_usd_amount = 10_000 * multiplier

  let actual_yes_amount = yes_amount * multiplier

  let deposit_input_ref = mock_utxo_ref(1, 11)
  let market_datum =
    MarketDatum {
      market_creator_address,
      market_validator_hash: market_validator_pid_t,
      market_token: m_asset,
      end_date: 1758493411,
      starting_q: StartingQ { q_yes: 5_000, q_no: 5_000 },
      starting_p: StartingP { p_yes: 5_000, p_no: 5_000 },
      q,
      q_yes,
      q_no,
      p_yes,
      p_no: 5_000,
      winner: None,
    }
  let deposit_input =
    Input {
      output_reference: deposit_input_ref,
      output: Output {
        address: Address {
          payment_credential: Script(deposit_validator_hash_t),
          stake_credential: None,
        },
        value: assets.merge(
          from_lovelace(2_000_000),
          from_asset(t_usdc_pid, t_usdc_an, t_usd_amount),
        )
          |> assets.add(market_validator_pid_t, market_creator_nft, 1),
        datum: InlineDatum(market_datum),
        reference_script: None,
      },
    }

  let user_reduce_value_precised = p_yes * actual_yes_amount
  let user_reduce_value = user_reduce_value_precised / precision_factor
  let new_t_usd_amount = t_usd_amount - user_reduce_value
  let deposit_output =
    Output {
      address: Address {
        payment_credential: Script(deposit_validator_hash_t),
        stake_credential: None,
      },
      value: assets.merge(
        from_lovelace(2_000_000),
        from_asset(t_usdc_pid, t_usdc_an, new_t_usd_amount),
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
          q: new_q,
          q_yes: new_q_yes,
          q_no: 5_000,
          p_yes: new_p_yes,
          p_no: new_p_no,
          winner: None,
        },
      ),
      reference_script: None,
    }

  let user_input =
    Input {
      output_reference: mock_utxo_ref(0, 10),
      output: Output {
        address: user_addr,
        value: assets.merge(
          from_lovelace(2000000),
          from_asset(t_usdc_pid, t_usdc_an, 500_000_000),
        )
          |> assets.add(market_validator_pid_t, token_name, yes_amount),
        datum: NoDatum,
        reference_script: None,
      },
    }
  let user_output =
    Output {
      address: user_addr,
      value: assets.merge(
        from_lovelace(2000000),
        from_asset(t_usdc_pid, t_usdc_an, 500_000_000 + user_reduce_value),
      ),
      datum: NoDatum,
      reference_script: None,
    }

  let mint = from_asset(market_validator_pid_t, token_name, -yes_amount)

  let tx =
    Transaction {
      ..placeholder,
      inputs: [deposit_input, user_input],
      outputs: [deposit_output, user_output],
      mint: mint,
      extra_signatories: [user_vkh],
    }

  deposit_validator.spend(
    global_settings_validator_hash_t,
    Some(market_datum),
    YesMarketSell(yes_amount, user_addr),
    deposit_input_ref,
    tx,
  )
}

test test_no_market_sell() {
  let user_addr = mock_pub_key_address(11, None)
  let user_vkh = mock_pub_key_hash(11)
  let no_amount = 400

  let token_name = no_token_name

  let q = 10_000
  let p_no = 5_000
  let q_no = 5_000
  let q_yes = 5_000

  let new_q = q - no_amount
  let new_q_no = q_no - no_amount

  let new_p_no_num = new_q_no * precision_factor
  let new_p_no = new_p_no_num / new_q

  let p_yes_num = q_yes * precision_factor
  let new_p_yes = p_yes_num / new_q

  let market_creator_address = mock_pub_key_address(0, None)

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
  let t_usd_amount = 10_000 * multiplier

  let actual_no_amount = no_amount * multiplier

  let deposit_input_ref = mock_utxo_ref(1, 11)
  let market_datum =
    MarketDatum {
      market_creator_address,
      market_validator_hash: market_validator_pid_t,
      market_token: m_asset,
      end_date: 1758493411,
      starting_q: StartingQ { q_yes: 5_000, q_no: 5_000 },
      starting_p: StartingP { p_yes: 5_000, p_no: 5_000 },
      q,
      q_no,
      q_yes,
      p_no,
      p_yes: 5_000,
      winner: None,
    }
  let deposit_input =
    Input {
      output_reference: deposit_input_ref,
      output: Output {
        address: Address {
          payment_credential: Script(deposit_validator_hash_t),
          stake_credential: None,
        },
        value: assets.merge(
          from_lovelace(2_000_000),
          from_asset(t_usdc_pid, t_usdc_an, t_usd_amount),
        )
          |> assets.add(market_validator_pid_t, market_creator_nft, 1),
        datum: InlineDatum(market_datum),
        reference_script: None,
      },
    }

  let user_reduce_value_precised = p_no * actual_no_amount
  let user_reduce_value = user_reduce_value_precised / precision_factor
  let new_t_usd_amount = t_usd_amount - user_reduce_value
  let deposit_output =
    Output {
      address: Address {
        payment_credential: Script(deposit_validator_hash_t),
        stake_credential: None,
      },
      value: assets.merge(
        from_lovelace(2_000_000),
        from_asset(t_usdc_pid, t_usdc_an, new_t_usd_amount),
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
          q: new_q,
          q_no: new_q_no,
          q_yes: 5_000,
          p_no: new_p_no,
          p_yes: new_p_yes,
          winner: None,
        },
      ),
      reference_script: None,
    }

  let user_input =
    Input {
      output_reference: mock_utxo_ref(0, 10),
      output: Output {
        address: user_addr,
        value: assets.merge(
          from_lovelace(2000000),
          from_asset(t_usdc_pid, t_usdc_an, 500_000_000),
        )
          |> assets.add(market_validator_pid_t, token_name, no_amount),
        datum: NoDatum,
        reference_script: None,
      },
    }
  let user_output =
    Output {
      address: user_addr,
      value: assets.merge(
        from_lovelace(2000000),
        from_asset(t_usdc_pid, t_usdc_an, 500_000_000 + user_reduce_value),
      ),
      datum: NoDatum,
      reference_script: None,
    }

  let mint = from_asset(market_validator_pid_t, token_name, -no_amount)

  let tx =
    Transaction {
      ..placeholder,
      inputs: [deposit_input, user_input],
      outputs: [deposit_output, user_output],
      mint: mint,
      extra_signatories: [user_vkh],
    }

  deposit_validator.spend(
    global_settings_validator_hash_t,
    Some(market_datum),
    NoMarketSell(no_amount, user_addr),
    deposit_input_ref,
    tx,
  )
}
