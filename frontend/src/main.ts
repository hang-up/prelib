import { createApp } from "vue";

import App from "./App.vue";
import { frontendConfig } from "./config";
import router from "./router";
import "./styles.css";

document.title = frontendConfig.appTitle;

createApp(App).use(router).mount("#app");
