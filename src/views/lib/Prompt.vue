<template>
  <v-dialog overlay-color="#000" @input="modelClose" max-width="500px" :value="promptStore.show">
    <v-card color="background" class="rounded-lg">
      <v-card-title class="pt-4 text-center pb-3 text-body-2 d-block">
        {{ promptStore.message }}
      </v-card-title>
      <v-divider />
      <v-card-text class="px-2 pt-5 pb-0">
        <v-textarea
          solo
          flat
          clearable
          background-color="background darken-2"
          class="rounded-lg"
          auto-grow
          autofocus
          rows="1"
          :placeholder="promptStore.placeholder"
          :rules="promptStore.rules"
          v-model="promptStore.value" />
      </v-card-text>
      <v-divider />
      <v-card-actions class="pb-0">
        <v-btn block @click="bus.$emit('abort')" class="rounded-lg" color="background darken-2" elevation="0">
          {{ promptStore.abortText }}
        </v-btn>
      </v-card-actions>
      <v-card-actions>
        <v-btn :disabled="!promptStore.isValid(promptStore.value)" block @click="bus.$emit('confirm')" class="rounded-lg" color="primary" elevation="0">
          {{ promptStore.confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import promptStore, { bus } from '../../store/prompt'
@Component
export default class Prompt extends Vue {

  promptStore = promptStore
  bus = bus

  modelClose(b: boolean) {
    if (b === false) {
      bus.$emit('abort')
    }
  }
}
</script>
