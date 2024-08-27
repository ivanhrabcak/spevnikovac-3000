// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use spevnik::export::{__cmd__fetch, __cmd__get_editing_hints, fetch, get_editing_hints};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![fetch, get_editing_hints])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
