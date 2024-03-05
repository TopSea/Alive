// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use alive_lib;

#[tokio::main]
async fn main() {
    alive_lib::run();
}
