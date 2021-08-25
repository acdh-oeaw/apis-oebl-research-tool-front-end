<template>
  <v-card style="position: relative" color="transparent" class="rounded-lg" elevation="0" width="300">
    <v-overlay v-if="loading" absolute>
      <loading-spinner size="40" color="white" />
    </v-overlay>
    <v-card-text>
      <v-form test-id="login-form" @submit.prevent="login">
        <v-text-field
          test-id="user-field"
          class="input-no-stroke"
          hide-details
          dark
          v-model="user"
          flat
          :autocomplete="false"
          autofocus
          placeholder="User Name" />
        <v-divider />
        <v-text-field
          :append-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
          :type="showPassword ? 'text' : 'password'"
          test-id="password-field"
          ref="passwordField"
          class="input-no-stroke mt-1 pt-0"
          hide-details
          :autocomplete="false"
          name="password"
          @click:append="showPassword = !showPassword"
          dark
          v-model="password"
          style="box-shadow: inset 0 0 20px 20px #252525"
          flat
          placeholder="Password" />
        <v-btn
          type="submit"
          class="rounded-lg mt-3"
          block
          elevation="0">
          Login
        </v-btn>
        <v-alert
          :value="message !== ''"
          transition="scale-transition"
          class="mt-2"
          color="pink darken-4 caption "
          dense>{{ message }}
        </v-alert>
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
  message = ''
  loading = false
  showPassword = false

  async login() {
    if (this.user && this.password) {
      this.message = ''
      this.loading = true
      const success = await store.logIn(this.user, this.password)
      this.loading = false
      if (!success) {
        this.message = 'Falsches Passwort oder falscher Nutzername.'
        const pwdEl = this.$el.querySelector('[type=password]')
        if (pwdEl instanceof HTMLInputElement) {
          pwdEl.select()
        }
      } else {
        this.message = ''
      }
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
