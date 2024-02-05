import { createApp } from "vue";
import "./styles.css";
import App from "./App.vue";

import zh_CN from "./components/lang/zh_CN.json"
import en_US from "./components/lang/en_US.json"
import { createI18n } from 'vue-i18n';
const localeTxt = { zh_CN, en_US }

const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'zh_CN', // set locale
    fallbackLocale: 'en_US', // set fallback locale
    messages: localeTxt, // set locale messages
})
createApp(App).use(i18n).mount("#app");

// npx tailwindcss -i ./src/tailwind.css -o ./src/styles.css --watch
// https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json
// https://mirror.ghproxy.com/https://raw.githubusercontent.com/zenghongtu/live2d-model-assets/master/assets/moc3/lafei/lafei.model3.json