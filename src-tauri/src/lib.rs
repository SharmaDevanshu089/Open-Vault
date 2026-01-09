use tauri::Manager;
// use window_vibrancy::apply_acrylic;
use std::io;
use whoami::realname;
use window_vibrancy::apply_mica;
use winreg::enums::*;
use winreg::RegKey;
mod handle_setup;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use log::info;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            #[cfg(target_os = "windows")]
            {
                //TODO: Add a fallback for unsupported platforms
                let _ = apply_mica(&window, None).expect("Unsupported Platform");
                //TODO :Add option for mica on unsupported platform
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            set_mica_effect,
            check_first_run,
            get_full_name,
            setup_master_password
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn set_mica_effect(window: tauri::Window) {
    #[cfg(target_os = "windows")]
    let _ = apply_mica(&window, None);
}
#[tauri::command]
fn check_first_run() -> bool {
    // We define an internal helper to keep the '?' syntax for easy error handling
    fn internal_check() -> std::io::Result<bool> {
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let software = hkcu.open_subkey("Software")?;

        // Open or Create the "open_vault" key
        let (vault_key, _disp) = software.create_subkey("open_vault")?;

        // Try to get the value
        let is_installed: Result<u32, _> = vault_key.get_value("Installed");

        match is_installed {
            Ok(_) => {
                // Value exists -> Not first run
                Ok(false)
            }
            Err(_) => {
                // Value missing -> First run
                // Create the value now so next time returns false
                // vault_key.set_value("Installed", &1u32)?;
                Ok(true)
            }
        }
    }

    // Run the check. If ANY error happens (permissions, etc),
    // log it to the console and default to true (First Run).
    match internal_check() {
        Ok(is_first) => is_first,
        Err(e) => {
            println!("Registry error (defaulting to First Run): {}", e);
            true
        }
    }
}

#[tauri::command]
async fn get_full_name() -> String {
    let name = realname();
    name
}

#[tauri::command]
fn setup_master_password(password: String) -> Result<(), String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| e.to_string())?
        .to_string();

    // println!("Password hash: {}", password_hash);
    info!("Password hash: {}", password_hash);
    Ok(()) // <--- YOU NEED THIS
}
