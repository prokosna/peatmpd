import Vue from "vue";
import App from "./renderer/App.vue";
import vuetify from "./renderer/plugins/vuetify";
import store from "./renderer/store";

Vue.config.productionTip = false;

new Vue({
  vuetify,
  store,
  render: h => h(App)
}).$mount("#app");
