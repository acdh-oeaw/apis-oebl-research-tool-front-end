<template>
  <v-dialog overlay-color="#000" @input="modelClose" max-width="400px" :value="confirmStore.show">
    <v-card color="background" class="rounded-lg">
      <v-card-text class="pt-5 text-center pb-3">
        {{ confirmStore.message }}
      </v-card-text>
      <v-card-actions class="pb-0">
        <v-btn block @click="bus.$emit('confirm')" class="rounded-lg" color="primary" elevation="0">
          {{ confirmStore.confirmText }}
        </v-btn>
      </v-card-actions>
      <v-card-actions>
        <v-btn block @click="bus.$emit('abort')" class="rounded-lg" color="background darken-2" elevation="0">
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
