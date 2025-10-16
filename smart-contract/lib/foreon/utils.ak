use aiken/collection/list
use aiken/crypto.{ScriptHash, VerificationKeyHash}
use cardano/address.{Script, VerificationKey}
use cardano/assets.{AssetName, PolicyId, quantity_of}
use cardano/transaction.{InlineDatum, Input, Output}
use foreon/constants.{global_settings_nft, precision_factor}
use foreon/types.{GlobalSettingsDatum, ShareType, StartingP, StartingQ}

/// Multisig signature
pub fn is_multisig_signing(inputs: List<Input>, admin_sc: ScriptHash) {
  list.any(
    inputs,
    fn(input) { input.output.address.payment_credential == Script(admin_sc) },
  )
}

/// Get global settings
pub fn get_global_settings(
  global_settings_hash: ScriptHash,
  ref_inputs: List<Input>,
) -> Data {
  expect Some(global_settings_utxo) =
    list.find(
      ref_inputs,
      fn(input) {
        and {
          (input.output.address.payment_credential == Script(
            global_settings_hash,
          ))?,
          (quantity_of(
            input.output.value,
            global_settings_hash,
            global_settings_nft,
          ) == 1)?,
        }
      },
    )

  expect InlineDatum(global_settings_utxo_datum_data) =
    global_settings_utxo.output.datum
  expect GlobalSettingsDatum { .. } = global_settings_utxo_datum_data

  global_settings_utxo_datum_data
}

/// Calculates market's b
pub fn calc_b(init_liquidity: Int) -> Int {
  let ln_2_x = 693_147
  let ln_2_y = 1_000_000

  init_liquidity * ln_2_y / ln_2_x
}

/// Verifies the Market Datum during market creation
pub fn verify_market_datum(
  starting_p: StartingP,
  starting_q: StartingQ,
  q: Int,
  q_yes: Int,
  q_no: Int,
  p_yes: Int,
  p_no: Int,
  winner: Option<ShareType>,
  total_shares: Int,
  starting_p_yes: Int,
  starting_p_no: Int,
) {
  let StartingP { p_yes: starting_p_yes_d, p_no: starting_p_no_d } = starting_p
  let StartingQ { q_yes: starting_q_yes, q_no: starting_q_no } = starting_q

  let expected_s_q_yes =
    get_share_quantity(starting_p_yes, total_shares, precision_factor)
  let expected_s_q_no =
    get_share_quantity(starting_p_no, total_shares, precision_factor)

  expect and {
      // verify starting prices and quantity
      (starting_p_yes == starting_p_yes_d)?,
      (starting_p_no == starting_p_no_d)?,
      (expected_s_q_yes == starting_q_yes)?,
      expected_s_q_no == starting_q_no,
      // verify prices and quantity
      (q_yes == starting_q_yes)?,
      (q_no == starting_q_no)?,
      (p_yes == starting_p_yes)?,
      (p_no == starting_p_no)?,
      (q == q_yes + q_no)?,
      (winner == None)?,
    }
}

/// Returns the quantity of a share based on its price, total shares, and a precision factor
/// Price is precised in a multiple of the `precision_factor` constant
pub fn get_share_quantity(
  price: Int,
  total_shares: Int,
  precision_fact: Int,
) -> Int {
  let share_quantity_precised = total_shares * price
  share_quantity_precised / precision_fact
}

/// Filters inputs by verification key hash
pub fn filter_inputs_by_vkh(inputs: List<Input>, vkh: VerificationKeyHash) {
  list.filter(
    inputs,
    fn(input) {
      input.output.address.payment_credential == VerificationKey(vkh)
    },
  )
}

/// Filters outputs by vkh
pub fn filter_outputs_by_vkh(outputs: List<Output>, vkh: VerificationKeyHash) {
  list.filter(
    outputs,
    fn(output) { output.address.payment_credential == VerificationKey(vkh) },
  )
}

/// Returns the amount of aggregated inputs and outputs quantity of a particular token for specific user
pub fn get_user_asset_amt_in_out(
  inputs: List<Input>,
  outputs: List<Output>,
  user_vkh: VerificationKeyHash,
  ast_policy_id: PolicyId,
  ast_asset_name: AssetName,
) {
  // get all inputs coming from user's wallet
  let user_wallet_inputs = filter_inputs_by_vkh(inputs, user_vkh)
  // get total asset input from user's wallet
  let user_wallet_total_ast_in =
    user_wallet_inputs
      |> list.foldl(
          0,
          fn(input, asset_total) {
            let asset_amount =
              quantity_of(input.output.value, ast_policy_id, ast_asset_name)
            asset_amount + asset_total
          },
        )

  // find outputs going back to the user's wallet
  let user_wallet_outputs = filter_outputs_by_vkh(outputs, user_vkh)
  // get total asset output to user's wallet
  let user_wallet_total_ast_out =
    user_wallet_outputs
      |> list.foldl(
          0,
          fn(output, asset_total) {
            let asset_amount =
              quantity_of(output.value, ast_policy_id, ast_asset_name)
            asset_amount + asset_total
          },
        )

  (user_wallet_total_ast_in, user_wallet_total_ast_out)
}
