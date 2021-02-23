<template>
  <v-card style="position: relative" color="transparent" class="rounded-lg" elevation="0" width="300">
    <v-overlay v-if="loading" absolute>
      <loading-spinner size="40" color="white" />
    </v-overlay>
    <v-card-text>
      <v-form @submit.prevent="login">
        <v-text-field
          class="input-no-stroke"
          hide-details
          v-model="user"
          flat
          :autocomplete="false"
          autofocus
          placeholder="User Name" />
        <v-divider />
        <v-text-field
          class="input-no-stroke mt-1 pt-0"
          hide-details
          :autocomplete="false"
          name="password"
          v-model="password"
          type="password"
          style="box-shadow: inset 0 0 20px 20px"
          flat
          placeholder="Password" />
        <v-btn
          type="submit"
          class="rounded-lg mt-3"
          block
          elevation="0">
          Login
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import store from '../store'
import LoadingSpinner from './lib/LoadingSpinner.vue'
@Component({
  components: { LoadingSpinner }
})
export default class LoginForm extends Vue {
  user = ''
  password = ''
  loading = false
  async login() {
    if (this.user && this.password) {
      this.loading = true
      await store.logIn(this.user, this.password)
      this.loading = false
    }
  }
}
</script>
<style lang="stylus">
@-webkit-keyframes autofill {
  0%,100% {
    color: #666;
    background: transparent;
  }
}

input:-webkit-autofill {
  -webkit-animation-delay: 1s; /* Safari support - any positive time runs instantly */
  -webkit-animation-name: autofill;
  -webkit-animation-fill-mode: both;
}
</style>
