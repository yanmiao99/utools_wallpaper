import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './plugin/router';

// 额外引入图标库
createApp(App)
    .use(createPinia())
    .use(router)
    .mount('#app');
