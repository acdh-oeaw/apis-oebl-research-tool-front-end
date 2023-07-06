import "@fontsource-variable/roboto-flex/standard.css";
import "@mdi/font/css/materialdesignicons.css";

import Vue from "vue";
import Vuetify from "vuetify/lib";
import colors from "vuetify/lib/util/colors";
import de from "vuetify/src/locale/de";

import store from "../store";

Vue.use(Vuetify);

/** Disable ripple effect. */
Vue.mixin({
	directives: {
		ripple: {},
	},
});

const plugin = new Vuetify({
	icons: {
		iconfont: "mdi",
	},
	lang: {
		locales: { de },
		current: "de",
	},
	theme: {
		dark: store.settings.darkTheme,
		options: {
			customProperties: true,
			variations: true,
		},
		themes: {
			light: {
				textcolor: "#333333",
				background: {
					lighten2: "#f9fbfe",
					lighten1: "#f2f8ff",
					base: "#f1f5fa",
					darken1: "#ecf2f9",
					darken2: "#e1e8f1",
					darken3: "#d0dbe9",
					darken4: "#c6cbd2",
				},
				// primary: '#6495ed',
				primary: colors.orange.darken1,
				// secondary: '#424242',
				secondary: "#617e8a",
				accent: "#82b1ff",
				error: "#ff5252",
				info: "#2196f3",
				success: "#4caf50",
				warning: "#ffc107",
				comment: colors.green.accent2,
				annotation_person: colors.orange.lighten3,
				annotation_place: colors.blue.lighten3,
				annotation_institution: colors.pink.lighten3,
				annotation_event: colors.red.lighten3,
				annotation_work: colors.lime.lighten3,
			},
			dark: {
				textcolor: "#ffffff",
				background: {
					lighten2: "#393e4b",
					lighten1: "#2d313b",
					base: "#282c35",
					darken1: "#252831",
					darken2: "#1c2025",
				},
				primary: "#d3892d",
				secondary: {
					base: "#393e4b",
				},
			},
		},
	},
});

export default plugin;
