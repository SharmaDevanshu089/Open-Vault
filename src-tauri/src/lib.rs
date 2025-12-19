// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;
// use window_vibrancy::apply_acrylic;
use window_vibrancy::apply_mica;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            #[cfg(target_os = "windows")]
            {
                //TODO: Add a fallback for unsupported platforms
                let _ = apply_mica(&window, None).expect("Unsupported Platform");
                // apply_acrylic(&window, Some((18, 18, 18, 125)))
                //     .expect("Unsupported platform! 'apply_acrylic' is failed.");
                // todo!("Add option for mica on unsupported platform");
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![set_mica_effect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn set_mica_effect(window: tauri::Window) {
    #[cfg(target_os = "windows")]
    let _ = apply_mica(&window, None);
}
