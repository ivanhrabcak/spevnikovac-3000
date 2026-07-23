fn main() {
    // Declaring the app commands here makes tauri-build autogenerate an
    // `allow-<command>` / `deny-<command>` permission for each one (in the
    // app's own ACL namespace). This is required so that the Ultimate Guitar
    // Cloudflare-bypass window (a *remote* origin) can be granted access to
    // `report_ug_page` via the `ug-fetch` capability: remote origins never get
    // the default "all app commands allowed" treatment that local windows do,
    // so the command must be explicitly allowed for that remote context.
    //
    // Note: declaring an app manifest switches the whole app to strict ACL
    // enforcement (even for local windows), so every command the main window
    // invokes must be granted in `capabilities/migrated.json`.
    tauri_build::try_build(
        tauri_build::Attributes::new().app_manifest(
            tauri_build::AppManifest::new().commands(&[
                "fetch",
                "get_editing_hints",
                "write_docx",
                "write_chordpro",
                "transpose",
                "report_ug_page",
            ]),
        ),
    )
    .expect("failed to run tauri-build");
}
