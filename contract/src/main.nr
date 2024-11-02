use dep::aztec::macros::aztec;

#[aztec]
contract Test {
    use dep::aztec::{
        prelude::{AztecAddress, FunctionSelector, NoteHeader, NoteGetterOptions, Map, PrivateContext, PrivateMutable},
        encrypted_logs::encrypted_note_emission::encode_and_encrypt_note,
        keys::getters::get_public_keys,
        oracle::debug_log::{debug_log, debug_log_format},
        macros::{storage::storage, functions::{private, initializer}},
    };

    use dep::value_note::value_note::ValueNote;

    #[storage]
    struct Storage<Context> {
        pm_note: PrivateMutable<ValueNote, Context>,
    }

    #[private]
    #[initializer]
    fn constructor() {
        let this = context.msg_sender();
        let this_keys = get_public_keys(this);

        let mut note = ValueNote::new(1, this_keys.npk_m.hash());
        storage.pm_note.initialize(&mut note).emit(encode_and_encrypt_note(&mut context, this_keys.ovpk_m, this_keys.ivpk_m, this));
    }

    #[private]
    fn test_private_mutable_read() -> Field {
        let note = storage.pm_note.get_note().note;
        note.value
    }

    #[private]
    fn test_private_mutable_read_with_note_emission() -> Field {
        let this = context.msg_sender();
        let this_keys = get_public_keys(this);

        let note_emisssion = storage.pm_note.get_note();
        note_emisssion.emit(encode_and_encrypt_note(&mut context, this_keys.ovpk_m, this_keys.ivpk_m, this));
        let mut note = note_emisssion.note;

        note.value
    }
}
