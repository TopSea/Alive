// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use axum::{
    extract::State, http::StatusCode, response::{IntoResponse, Response}, routing::{get, post}, Json, Router
};
use serde::{Deserialize, Serialize};
use std::{fs::File, io::Read, sync::OnceLock, env};
use tauri::{
    AppHandle, Manager, PhysicalPosition, PhysicalSize, Position, Size,Window, Wry,
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_store::{with_store, StoreCollection};
use tokio::{self, fs::remove_file, time};
use uuid::Uuid;

static ALIVE_WINDOW: OnceLock<Window> = OnceLock::new();

#[derive(Clone, Serialize, Deserialize)]
struct ChangeMotion {
    interrupt: bool,
    mode: String,
    motion_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    uu_json: Option<String>,
}
#[derive(Clone, Serialize, Deserialize)]
struct ChangeVolume {
    mode: String,
    volume: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    uu_json: Option<String>,
}
#[derive(Clone, Serialize, Deserialize)]
struct MinifyAlive {
    minify: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    uu_json: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct Motion {
    mode: String,
    playing_motion: String,
}
#[derive(Serialize, Deserialize)]
struct Volume {
    mode: String,
    volume: f32,
}
#[derive(Serialize)]
struct ErrorResponse<'a> {
    error: &'a str,
    info: &'a str,
}
static ERROR_RESP: ErrorResponse = ErrorResponse {
    error: "Alive not responding.",
    info:
        "Please check you request. More info can be found in doc: https://github.com/TopSea/Alive",
};

async fn hello_alive() -> &'static str {
    println!("Hello from client.{}", 123);
    match &ALIVE_WINDOW.get() {
        Some(window) => {
            window.emit("hello_alive", true).unwrap();
        }
        None => todo!(),
    }
    "Hello Alive"
}

fn create_temp_file() -> String {
    let mut base_path = std::env::current_dir().unwrap();
    let file_name = Uuid::new_v4().to_string() + ".json";
    let file_path = "data/temp/".to_string() + &file_name;
    base_path.push(file_path);
    let display = base_path.display();
    println!("Create file {}.", &display);

    // 创建文件
    let _ = File::create(&base_path);
    return display.to_string();
}

async fn wait_response(
    ref_path: &String,
) -> Response {
    let mut file = File::open(ref_path).unwrap();
    let mut done = false;
    let mut mill_secs = 0;
    let mut buffer = String::new();
    
    while true {
        // 超过 3s，退出阻塞
        if mill_secs >= 10 {
            break;
        }
        // 读取到返回信息，退出阻塞
        let _ = file.read_to_string(&mut buffer).unwrap();
        if buffer.len() > 0 {
            done = true;
            break;
        }

        time::sleep_until(time::Instant::now() + time::Duration::from_millis(300)).await;
        println!("which sec: {}", mill_secs);
        mill_secs += 1;
    }

    // 完事删除文件
    _ = remove_file(ref_path).await;

    match done {
        true => return (StatusCode::BAD_REQUEST, buffer).into_response(),
        false => return (StatusCode::BAD_REQUEST, Json(&ERROR_RESP)).into_response(),
    }
}

async fn change_motion(
    State(app_handler): State<AppHandle>,
    Json(payload): Json<ChangeMotion>
) -> Response {
    let mode = &payload.mode;
    let motion = &payload.motion_name;
    println!("Change {} motion to {}.", &mode, &motion);

    let file_path = create_temp_file();
    let request_motion = ChangeMotion {
        mode: mode.to_string(),
        motion_name: motion.to_string(),
        interrupt: payload.interrupt,
        uu_json: Some(file_path.to_string()),
    };

    _ = app_handler.emit_to("main", "change_motion", &request_motion);

    return wait_response(&file_path).await;
}

async fn change_volume(
    State(app_handler): State<AppHandle>,
    Json(payload): Json<ChangeVolume>,
) -> Response {
    let mode = &payload.mode;
    let volume = &payload.volume;
    println!("Change {} volume to {}.", &mode, &volume);

    let file_path = create_temp_file();

    let request_volume = ChangeVolume {
        mode: payload.mode,
        volume: payload.volume,
        uu_json: Some(file_path.to_string()),
    };
    _ = app_handler.emit_to("main", "change_volume", request_volume);

    return wait_response(&file_path).await;
}

async fn minify_alive(
    State(app_handler): State<AppHandle>,
    Json(payload): Json<MinifyAlive>,
) -> Response {
    let minify = payload.minify;
    println!("Minify Alive: {}.", &minify);

    let file_path = create_temp_file();

    let request_minify: MinifyAlive = MinifyAlive {
        minify: minify,
        uu_json: Some(file_path.to_string()),
    };
    _ = app_handler.emit_to("main", "minify_alive", request_minify);

    return wait_response(&file_path).await;
}

async fn start_http_server(app: AppHandle) {
    // build our application with a route
    let app = Router::new()
        // `GET /` goes to `root`
        .route("/", get(hello_alive))
        .route("/change/motion", post(change_motion))
        .route("/change/volume", post(change_volume))
        .route("/change/minify", post(minify_alive))
        .with_state(app);

    // run our app with hyper
    let listener = tokio::net::TcpListener::bind("10.158.197.102:20177")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            tauri::async_runtime::spawn(start_http_server(app.app_handle().clone()));
            let main_window = app.get_webview_window("main");

            let window = main_window.unwrap();
            let _ = window.set_skip_taskbar(true);

            // 读取并设置窗口大小和位置的信息
            let stores = app.state::<StoreCollection<Wry>>();
            let mut data = env::current_dir().unwrap();
            data.push("data/sets_alive.json");

            // 窗口大小和位置信息
            let mut win_w: u32 = 0;
            let mut win_h: u32 = 0;
            let mut pos_x: i32 = 0;
            let mut pos_y: i32 = 0;

            let mut click_through: bool = false;
            let mut stay_top: bool = true;
            let mut is_mmd: bool = true;

            with_store(app.app_handle().clone(), stores, data, |store| {
                win_w = match store.get("win_w") {
                    None => 1000,
                    Some(json) => json.as_u64().unwrap() as u32,
                };
                win_h = match store.get("win_h") {
                    None => 750,
                    Some(json) => json.as_u64().unwrap() as u32,
                };
                pos_x = match store.get("pos_x") {
                    None => 64,
                    Some(json) => json.as_i64().unwrap() as i32,
                };
                pos_y = match store.get("pos_y") {
                    None => 64,
                    Some(json) => json.as_i64().unwrap() as i32,
                };
                click_through = match store.get("click_through") {
                    None => false,
                    Some(json) => json.as_bool().unwrap(),
                };
                stay_top = match store.get("stay_top") {
                    None => true,
                    Some(json) => json.as_bool().unwrap(),
                };
                is_mmd = match store.get("is_mmd") {
                    None => true,
                    Some(json) => json.as_bool().unwrap(),
                };
                store.save()
            })
            .unwrap();

            window
                .set_size(Size::Physical(PhysicalSize {
                    width: win_w,
                    height: win_h,
                }))
                .unwrap();
            window
                .set_position(Position::Physical(PhysicalPosition { x: pos_x, y: pos_y }))
                .unwrap();

            // 设置其他信息
            window.set_ignore_cursor_events(click_through).unwrap();
            window.set_always_on_top(stay_top).unwrap();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
