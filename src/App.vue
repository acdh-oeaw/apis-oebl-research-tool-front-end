<template>
  <v-app :style="{ background: 'var(--v-background-base)' }">
    <v-overlay :value="store.isLoggedIn === false" opacity="1" z-index="99" absolute>
      <login-form />
    </v-overlay>
    <confirm />
    <prompt />
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
        <!-- <v-flex class="pa-3" style="width: 73px" shrink>
          <v-btn x-large :to="'/lemmas'" class="mb-2 rounded-lg" icon tile>
            <v-icon size="22" color="grey darken-1">mdi-bookshelf</v-icon>
          </v-btn>
          <v-btn x-large :to="'/issue/' + store.selectedIssue" class="mb-2 rounded-lg" icon tile>
            <v-icon size="22" color="" class="rotate-180">mdi-chart-box-outline</v-icon>
          </v-btn>
          <v-btn disabled x-large :to="'/bio/' + store.selectedBiography" class="mb-2 rounded-lg" icon tile>
            <v-icon size="22" color="grey darken-1">mdi-pen</v-icon>
          </v-btn>
          <transition name="fade">
            <div class="pt-2" v-if="requestState.isLoading === true" >
              <v-divider class="mb-2" />
              <loading-spinner
                :color="$vuetify.theme.dark ? 'white' : 'grey'"
                class="ml-3 mt-5" />
            </div>
          </transition>
        </v-flex> -->
        <v-flex v-if="showDrawer" class="" grow>
          <router-view name="sidebar" />
        </v-flex>
      </v-flex>
    </resizable-drawer>
    <keep-alive>
      <router-view :key="$route.fullPath" />
    </keep-alive>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import LoadingSpinner from './views/lib/LoadingSpinner.vue'
import ResizableDrawer from './views/lib/ResizableDrawer.vue'
import store from './store'
import LoginForm from './views/LoginForm.vue'
import Confirm from './views/lib/Confirm.vue'
import Prompt from './views/lib/Prompt.vue'
import { requestState } from '@/store/fetch'

@Component({
  components: {
    ResizableDrawer,
    LoadingSpinner,
    LoginForm,
    Confirm,
    Prompt
  }
})
export default class App extends Vue {

  store = store
  requestState = requestState
  get showDrawer(): boolean {
    if (
      this.$route.name === 'Issue' &&
      this.store.settings.issueManagerNavVisible === true
    ) {
      return true
    } else if (
      this.$route.name === 'Lemmas' &&
      this.store.settings.lemmaManagerNavVisible === true
    ) {
      return true
    } else {
      return false
    }
  }
}
</script>
<style lang="stylus">
  @import url(https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css);
</style>

// GLOBAL STYLES
<style lang="stylus">

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
  padding 3px
  background: transparent        /* color of the tracking area */

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
</style>
