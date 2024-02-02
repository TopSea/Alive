import { createApp } from "vue";
import "./styles.css";
import Settings from "./components/sets/Settings.vue";

import { createI18n } from 'vue-i18n';
const messages = {
    en: {
        hello: 'hello world'
    },
    cn: {
        hello: '你好，世界'
    }
}

const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'cn', // set locale
    fallbackLocale: 'en', // set fallback locale
    messages, // set locale messages
})

createApp(Settings).use(i18n).mount("#settings");