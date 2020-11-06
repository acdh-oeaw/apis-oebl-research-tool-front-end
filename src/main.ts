import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import lineClamp from 'vue-line-clamp'

Vue.config.devtools = true
Vue.config.performance = true
Vue.config.productionTip = true

Vue.use(lineClamp)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
