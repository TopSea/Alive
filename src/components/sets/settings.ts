import { createApp } from "vue";
import "../../styles.css";
import Settings from "./Settings.vue";

import zh_CN from "../lang/zh_CN.json"
import en_US from "../lang/en_US.json"
import { createI18n } from 'vue-i18n';
const localeTxt = { zh_CN, en_US }

const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'zh_CN', // set locale
    fallbackLocale: 'en_US', // set fallback locale
    messages: localeTxt, // set locale messages
})

createApp(Settings).use(i18n).mount("#settings");