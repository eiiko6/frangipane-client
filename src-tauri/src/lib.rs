mod audio;
use audio::{get_audio_hosts, get_input_devices, start_microphone, stop_microphone};

#[tauri::command]
fn log(message: &str) {
    println!("[JS] {}", message);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(audio::AudioState::new())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            start_microphone,
            stop_microphone,
            log,
            get_input_devices,
            get_audio_hosts
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
