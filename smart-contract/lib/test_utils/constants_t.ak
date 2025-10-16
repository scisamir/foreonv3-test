use mocktail/virgin_key_hash.{mock_script_hash}
use mocktail/virgin_output_reference.{mock_utxo_ref}

pub const deposit_validator_hash_t = mock_script_hash(1)

pub const market_validator_pid_t = mock_script_hash(2)

pub const global_settings_validator_hash_t = mock_script_hash(0)

pub const utxo_ref_t = mock_utxo_ref(0, 23)

pub const admin_t = mock_script_hash(10)
