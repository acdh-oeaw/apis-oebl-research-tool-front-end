import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import de from 'vuetify/src/locale/de'
import store from '../store'
import colors from 'vuetify/lib/util/colors'
Vue.use(Vuetify)

// override (disable) ripple effect.
Vue.mixin({
  directives: {
    ripple: {}
  }
})

export default new Vuetify({
  theme: {
    dark: store.settings.darkTheme,
    options: {
      customProperties: true,
      variations: true
    },
    themes: {
      light: {
        textcolor: '#333333',
        background: {
          lighten2: '#F9FBFE',
          lighten1: '#f2f8ff',
          base: '#F1F5FA',
          darken1: '#ECF2F9',
          darken2: '#e1e8f1',
          darken3: '#D7DDE4',
          darken4: '#C6CBD2'
        },
        // primary: '#6495ed',
        primary: colors.orange.darken1,
        secondary: '#617e8a',
        // secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107'
      },
      // NORD:
      dark: {
        textcolor: '#ffffff',
        background: {
          lighten2: '#393e4b',
          lighten1: '#2D313B',
          base: '#282C35',
          darken1: '#252831',
          darken2: '#1C2025'
        },
        primary: '#d3892d',
        secondary: {
          base: '#393e4b'
        }
      },
      // dark: {
      //   inset: '#2b2a2a',
      //   foreground: '#303030',
      //   background: '#1f1f1f',
      //   sidebar: '#303030',
      //   primary: colors.orange.darken1,
      //   secondary: colors.blueGrey.lighten3
      // }
    }
  },
  lang: {
    locales: { de },
    current: 'de'
  }
})
