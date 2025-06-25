import './assets/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { BarcodeGeneratorPlugin } from '@syncfusion/ej2-vue-barcode-generator';

const app = createApp(App);
app.use(BarcodeGeneratorPlugin);
app.use(router);
app.mount('#app');