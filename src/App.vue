<template>
  <v-app
    :style="{ background: 'var(--v-background-base)' }"
  >
    <!-- <v-overlay
      :value="showHelpOverlay"
      z-index="99"
      absolute
      color="#000000"
      opacity=".8"
    >
      <v-list style="font-size: 1.75em" color="transparent">
        <v-list-item>
          <v-list-item-title>
            Globale Suche aktivieren
          </v-list-item-title>
          <v-list-item-action-text class="pl-2 text-no-wrap">
            STRG + F
          </v-list-item-action-text>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>
            Lemma Anlegen
          </v-list-item-title>
          <v-list-item-action-text class="pl-2 text-no-wrap">
            STRG + N
          </v-list-item-action-text>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>
            Lemma löschen
          </v-list-item-title>
          <v-list-item-action-text class="pl-2 text-no-wrap">
            Backspace/Entfernen
          </v-list-item-action-text>
        </v-list-item>
      </v-list>
    </v-overlay> -->
    <!-- LOGIN FORM -->
    <v-overlay
      v-if="store.isLoggedIn === false"
      :value="store.isLoggedIn === false"
      opacity="1"
      z-index="99"
      absolute>
      <login-form />
    </v-overlay>
    <!-- GLOBAL SEARCH -->
    <global-search
      v-model="store.showSearchDialog"
    />
    <!-- CONFIRM AND PROMPT -->
    <confirm />
    <prompt />
    <!-- LEFT NAVIGATION -->
    <resizable-drawer
      :card="false"
      :right="false"
      floating
      color="background darken-2"
      stateless
      app
      :value="showDrawer"
      left
      mini-variant-width="73"
      class="pa-0"
      @update:width="store.settings = {...store.settings, drawerLeftWidth: $event}"
      :width="store.settings.drawerLeftWidth">
      <v-flex class="flex-row d-flex fill-height pr-3 pt-5 pl-3">
        <v-flex v-if="showDrawer" class="" grow>
          <lemma-navigation />
        </v-flex>
      </v-flex>
    </resizable-drawer>
    <keep-alive>
      <router-view />
    </keep-alive>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import LoadingSpinner from '@/views/lib/LoadingSpinner.vue'
import ResizableDrawer from '@/views/lib/ResizableDrawer.vue'
import store from '@/store'
import LoginForm from '@/views/LoginForm.vue'
import Confirm from '@/views/lib/Confirm.vue'
import Prompt from '@/views/lib/Prompt.vue'
import { requestState } from '@/store/fetch'
import GlobalSearch from '@/views/GlobalSearch.vue'
import LemmaNavigation from '@/views/LemmaManager/LemmaNavigation.vue'

@Component({
  components: {
    ResizableDrawer,
    GlobalSearch,
    LoadingSpinner,
    LoginForm,
    Confirm,
    Prompt,
    LemmaNavigation
  }
})
export default class App extends Vue {

  store = store
  requestState = requestState
  showHelpOverlay = false

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      e.stopPropagation()
      store.showSearchDialog = !store.showSearchDialog
    } else if (e.key === 'Control' || e.key === 'Meta') {
      const timer = setTimeout(() => {
        this.showHelpOverlay = true
      }, 1000)
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const vm = this
      window.addEventListener('keyup', function clearHandler() {
        clearTimeout(timer)
        vm.showHelpOverlay = false
        window.removeEventListener('keyup', clearHandler)
      })
    }
  }

  mounted() {
    window.addEventListener('keydown', this.onKeyDown)
  }

  get showDrawer(): boolean {
    return this.store.settings.showNavDrawer
  }
}
</script>
<style lang="stylus">
  @import url(https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css);
</style>

// GLOBAL STYLES
<style lang="stylus">

.v-icon
  transition none

.v-navigation-drawer
  max-height none !important
  height 100% !important

.theme--light.v-application
  font-family --apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif

.rotate-180
  transform rotate(180deg)

.theme--light .soft-shadow
  box-shadow 0 5px 55px rgba(0,0,50,.2) !important

.theme--dark .soft-shadow
  box-shadow 0 0 55px rgba(0,0,0,.3) !important

.v-application .v-btn
  text-transform none
  letter-spacing normal

::-webkit-scrollbar
  background: transparent;

::-webkit-scrollbar-track
::-moz-scrol
  padding 3px
  background: transparent /* color of the tracking area */

::-webkit-scrollbar
  width 8px
  height 8px

::-webkit-scrollbar-thumb
  border-radius: 20px;

.theme--dark ::-webkit-scrollbar-thumb
  background-color rgba(255,255,255,.5)

.theme--light ::-webkit-scrollbar-thumb
  background-color rgba(0,0,25,.253)

.sticky
  position sticky
  top 0

.badge
  display inline-block
  margin-left 3px
  border-radius 10px
  padding 0 5px
  font-size 12px
  color white

h1
  text-transform none
  letter-spacing normal
  opacity .85
  font-weight 900
  line-height 1em
  font-size 1.7em
  white-space nowrap
  overflow hidden
  text-overflow ellipsis
  &:focus
    text-overflow clip

.muted
  opacity .7

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
  transition: none !important

.ellipsis
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
</style>
