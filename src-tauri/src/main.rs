// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use spevnik::export::{
    __cmd__fetch, __cmd__get_editing_hints, __cmd__transpose, __cmd__write_docx, fetch,
    get_editing_hints, transpose, write_docx,
};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            fetch,
            get_editing_hints,
            write_docx,
            transpose
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
