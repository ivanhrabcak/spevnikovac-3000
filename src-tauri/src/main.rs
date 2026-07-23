// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            spevnik::export::fetch,
            spevnik::export::get_editing_hints,
            spevnik::export::write_docx,
            spevnik::export::write_chordpro,
            spevnik::export::transpose,
            spevnik::export::report_ug_page
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
