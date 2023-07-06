<template>
	<v-app :style="{ background: 'var(--v-background-base)' }">
		<!-- LOGIN FORM -->
		<v-overlay
			v-if="store.isLoggedIn === false"
			:value="store.isLoggedIn === false"
			opacity="1"
			z-index="99"
			absolute
		>
			<login-form />
		</v-overlay>
		<!-- GLOBAL SEARCH -->
		<global-search v-model="store.showSearchDialog" />
		<!-- CONFIRM AND PROMPT -->
		<confirm />
		<prompt />
		<!-- LEFT NAVIGATION -->
		<resizable-drawer
			:card="false"
			:right="false"
			:floating="true"
			color="background darken-2"
			stateless
			app
			:value="showDrawer"
			left
			mini-variant-width="73"
			class="pa-0"
			:width="store.settings.drawerLeftWidth"
			@update:width="store.settings = { ...store.settings, drawerLeftWidth: $event }"
		>
			<sidebar v-if="showDrawer" class="px-3 pt-5" />
		</resizable-drawer>
		<!-- THE CONTENT -->
		<keep-alive>
			<router-view />
		</keep-alive>
	</v-app>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { requestState } from "@/api/core/request";
import store from "@/store";
import GlobalSearch from "@/views/GlobalSearch.vue";
import Confirm from "@/views/lib/Confirm.vue";
import LoadingSpinner from "@/views/lib/LoadingSpinner.vue";
import Prompt from "@/views/lib/Prompt.vue";
import ResizableDrawer from "@/views/lib/ResizableDrawer.vue";
import LoginForm from "@/views/LoginForm.vue";
import Sidebar from "@/views/Sidebar.vue";

@Component({
	components: {
		ResizableDrawer,
		GlobalSearch,
		LoadingSpinner,
		LoginForm,
		Confirm,
		Prompt,
		Sidebar,
	},
})
export default class App extends Vue {
	store = store;
	requestState = requestState;

	onKeyDown(e: KeyboardEvent) {
		if (e.key === "f" && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			e.stopPropagation();
			store.showSearchDialog = !store.showSearchDialog;
		}
	}

	mounted() {
		window.addEventListener("keydown", this.onKeyDown);
	}

	get showDrawer(): boolean {
		return this.$route.query["minimal"] ? false : this.store.settings.showNavDrawer;
	}
}
</script>

// GLOBAL STYLES
<style lang="stylus">

:focus-visible
  outline var(--v-primary-base) auto 1px

// ::selection
//   background var(--v-primary-lighten2) !important
//   color rgba(0,0,0,.7)

.v-icon
  transition none

// .v-navigation-drawer
//   max-height none !important
//   height 100% !important

body .v-application .text-body-3
body .v-application .text-body-2
  font-size 0.8rem !important

body
.v-application
  font-family "Roboto Flex", ui-sans-serif, system-ui, sans-serif

.rotate-180
  transform rotate(180deg)

.theme--light .soft-shadow
  box-shadow 0 5px 55px rgb(0 0 50 / 20%) !important

.theme--dark .soft-shadow
  box-shadow 0 0 55px rgb(0 0 0 / 30%) !important

.v-application .v-btn
  letter-spacing normal
  text-transform none

::-webkit-scrollbar
  background transparent

::-webkit-scrollbar-track
::-moz-scrol
  padding 3px
  background transparent /* color of the tracking area */

::-webkit-scrollbar
  width 8px
  height 8px

::-webkit-scrollbar-thumb
  border-radius 20px

.theme--dark ::-webkit-scrollbar-thumb
  background-color rgb(255 255 255 / 50%)

.theme--light ::-webkit-scrollbar-thumb
  background-color rgb(0 0 25 / 25.3%)

.sticky
  position sticky
  top 0

.badge
  display inline-block
  margin-left 3px
  padding 0 5px
  border-radius 10px
  color white
  font-size 12px
  text-decoration none

header h1
  overflow hidden
  font-weight 900
  font-size 1.5em
  line-height 1em
  letter-spacing normal
  text-transform none
  text-overflow ellipsis
  white-space nowrap
  opacity 85%

  &:focus
    text-overflow clip

.muted
  opacity 70%

.fill-width
  width 100%

// this is usually "0", i.e. the same as the __content.
// this prevents an edge case, where it overlaps the content.
.v-toolbar__extension
  z-index -1 !important

.scrollable
  overflow auto
  max-height 90vh

[tabindex="-1"]
  outline none

.transition-none
  transition none !important

.ellipsis
  overflow hidden
  text-overflow ellipsis
  white-space nowrap

// tippy.js theme
.tippy-content
  padding 9px !important

.tippy-box
  border-radius 13px !important
  background var(--v-background-base) !important
  box-shadow 0 5px 55px rgb(0 0 50 / 20%) !important

.tippy-box[data-placement^='top'] > .tippy-arrow::before
  border-top-color var(--v-background-base) !important

.tippy-box[data-placement^='bottom'] > .tippy-arrow::before
  border-bottom-color var(--v-background-base) !important

.tippy-box[data-placement^='left'] > .tippy-arrow::before
  border-left-color var(--v-background-base) !important

.tippy-box[data-placement^='right'] > .tippy-arrow::before
  border-right-color var(--v-background-base) !important

.v-list.x-dense .v-list-item
.v-list-item.x-dense
  min-height auto
  max-height 32px
  margin-bottom 1px !important

  .v-list-item__action
    margin 0

  .v-list-item__title
  .v-list-item__subtitle
    margin-bottom 0 !important
    font-size 13px

  .v-list-item__avatar
    width 15px !important
    min-width 15px !important
    margin-right 8px

.v-list.x-dense.v-list--two-line .v-list-item
.v-list-item.x-dense.v-list-item--two-line
  max-height 42px

.cursor-pointer
  cursor pointer

select
  width 100%
  margin 0
  padding 0 1em 0 0
  border none
  // Additional resets for further consistency
  background-color transparent
  outline none
  font-size inherit
  font-family inherit
  line-height inherit
  cursor inherit
  // A reset of styles, including removing the default dropdown arrow
  appearance none

select::after
  content "\F0140"
  display block
  font 400 normal normal 24px/1 "Material Design Icons"
</style>
