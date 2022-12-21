import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import Toaster from "@meforma/vue-toaster";

createApp(App).use(Toaster).mount("#app");
