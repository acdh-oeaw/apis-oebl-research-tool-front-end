import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
// import { VTextarea } from 'vuetify/lib'

Vue.config.productionTip = false

// const irsTextField: Vue.Component = {
//   extends: VTextarea,
//   mixins: [
//     {
//       props: {
//         flat: { default: true },
//         solo: { default: true },
//         dense: { default: true },
//         autoGrow: { default: true },
//         rows: { default: '1' },
//         backgroundColor: 'background darken-2',
//         hideDetails: { default: true }
//       }
//     }
//   ]
// }

new Vue({
  router,
  vuetify,
  render: h => h(App),
  // components: { irsTextField }
}).$mount('#app')
