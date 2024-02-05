import { createApp } from "vue";
import "../../styles.css";
import Updater from "./Updater.vue";
import { checkUpdate } from "@tauri-apps/api/updater";

import zh_CN from "../lang/zh_CN.json"
import en_US from "../lang/en_US.json"
import { createI18n } from 'vue-i18n';
import { WebviewWindow } from "@tauri-apps/api/window";
const localeTxt = { zh_CN, en_US }

const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'zh_CN', // set locale
    fallbackLocale: 'en_US', // set fallback locale
    messages: localeTxt, // set locale messages
})
createApp(Updater).use(i18n).mount("#updater");

var updaterOpened = false

function openUpdater() {
    if (updaterOpened) {
        const updaterWindow = WebviewWindow.getByLabel('tauri_win_updater');
        updaterWindow?.show();
        updaterWindow?.unminimize();
        updaterWindow?.setFocus();
    } else {
        const settingsWindow = new WebviewWindow('tauri_win_updater', {
            url: '/pages/updater.html',
            x: 364,
            y: 64,
            width: 600,
            height: 260,
            resizable: false,
            title: "Alive Updater",
            fullscreen: false,
        });

        settingsWindow.once('tauri://created', function () {
            console.log('tauri://created');
            updaterOpened = true;
        });
        settingsWindow.once('tauri://destroyed', function () {
            console.log('tauri://destroyed');
            updaterOpened = false;
        });
    }
}

export async function checkAliveUpdate(open: boolean) {
    console.log("checkAliveUpdate");
    try {
        const { shouldUpdate } = await checkUpdate();
        if (shouldUpdate && open) {
            openUpdater();
        }
    } catch (error) {
        console.error(error);
    }
}