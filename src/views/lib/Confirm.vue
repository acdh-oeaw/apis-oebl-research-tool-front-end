<template>
  <v-dialog test-id="confirm-dialog" overlay-color="#000" @input="modelClose" max-width="400px" :value="confirmStore.show">
    <v-card color="background" class="rounded-lg pa-3">
      <v-card-text class="text-center pb-4 pt-2">
        <div v-if="confirmStore.icon !== undefined" class="my-2">
          <v-icon large>{{ confirmStore.icon }}</v-icon>
        </div>
        {{ confirmStore.message }}
      </v-card-text>
      <v-card-actions class="pa-0">
        <v-btn test-id="confirm-submit-btn" block @click="bus.$emit('confirm')" class="rounded-lg" color="primary" elevation="0">
          {{ confirmStore.confirmText }}
        </v-btn>
      </v-card-actions>
      <v-card-actions class="pa-0 pt-2" v-if="confirmStore.showCancel">
        <v-btn test-id="confirm-abort-btn" block @click="bus.$emit('abort')" class="rounded-lg" color="background darken-2" elevation="0">
          {{ confirmStore.abortText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import confirmStore, { bus } from '../../store/confirm'
@Component
export default class Confirm extends Vue {

  confirmStore = confirmStore
  bus = bus

  modelClose(b: boolean) {
    if (b === false) {
      bus.$emit('abort')
    }
  }
}
</script>
