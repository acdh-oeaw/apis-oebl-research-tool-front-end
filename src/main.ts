import Vue from "vue";

import App from "@/app.vue";
import { router } from "@/lib/router";
import { vuetify } from "@/lib/vuetify";

Vue.config.productionTip = false;
Vue.config.performance = true;

new Vue({
	router,
	vuetify,
	render(h) {
		return h(App);
	},
}).$mount("#app");
