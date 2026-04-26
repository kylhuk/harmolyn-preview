use tauri::{AppHandle, Manager, WebviewWindow};
use std::path::PathBuf;

/// Resolves the path to the xorein control token file on the current platform.
fn xorein_token_path() -> Option<PathBuf> {
    #[cfg(target_os = "linux")]
    {
        dirs_next::data_local_dir().map(|d| d.join("xorein").join("control.token"))
    }
    #[cfg(target_os = "macos")]
    {
        dirs_next::data_dir().map(|d| d.join("xorein").join("control.token"))
    }
    #[cfg(target_os = "windows")]
    {
        dirs_next::data_dir().map(|d| d.join("xorein").join("control.token"))
    }
}

/// Returns the xorein control token, reading from the standard data dir path.
/// Returns an empty string if the file doesn't exist or can't be read.
#[tauri::command]
fn read_xorein_control_token() -> String {
    xorein_token_path()
        .and_then(|p| std::fs::read_to_string(p).ok())
        .map(|s| s.trim().to_owned())
        .unwrap_or_default()
}

/// Forwards an aether:// deep-link URL received by the OS to the webview.
fn forward_deeplink(window: &WebviewWindow, url: &str) {
    let _ = window.eval(&format!(
        "window.__harmolyn_deeplink__ && window.__harmolyn_deeplink__({:?})",
        url
    ));
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            // When a second instance is launched with a deeplink arg, forward it.
            let url = args.get(1).cloned().unwrap_or_default();
            if url.starts_with("aether://") {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.set_focus();
                    forward_deeplink(&window, &url);
                }
            }
        }))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Register aether:// scheme for deep links.
            #[cfg(any(target_os = "linux", target_os = "windows"))]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                app.deep_link().register("aether")?;
            }

            // Inject the control token into the webview via localStorage on startup.
            let token = read_xorein_control_token();
            if !token.is_empty() {
                if let Some(window) = app.get_webview_window("main") {
                    let script = format!(
                        "try {{ localStorage.setItem('harmolyn:xorein:control-token', {:?}); }} catch(e) {{}}",
                        token
                    );
                    let _ = window.eval(&script);
                }
            }

            // Listen for OS-level deep links forwarded by tauri-plugin-deep-link.
            let app_handle: AppHandle = app.handle().clone();
            app.deep_link().on_open_url(move |event| {
                for url in event.urls() {
                    let url_str = url.to_string();
                    if let Some(window) = app_handle.get_webview_window("main") {
                        let _ = window.set_focus();
                        forward_deeplink(&window, &url_str);
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![read_xorein_control_token])
        .run(tauri::generate_context!())
        .expect("error while running harmolyn");
}
