<template>
  <div>
    <v-dialog
      overlay-color="black"
      overlay-opacity=".7"
      transition="fade-transition"
      max-width="1000"
      content-class="elevation-0"
      :value="value"
      @input="$emit('input', $event)">
      <v-card v-if="value" color="transparent" flat>
        <v-card-title>
          <input
            v-model="searchText"
            @keydown.esc.capture.prevent.stop="onEsc"
            ref="input"
            class="pa-3 rounded-lg global-search background darken-1"
            placeholder="Suchen…"
            type="text" />
        </v-card-title>
        <v-card-text style="min-height: 300px">
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class GlobalSearch extends Vue {

  @Prop({ default: false }) value!: boolean
  searchText = ''

  @Watch('value')
  async onChangeVisibility() {
    await this.$nextTick()
    if (this.$refs.input instanceof HTMLInputElement) {
      await this.$nextTick()
      this.$refs.input.focus()
      this.$refs.input.select()
    }
  }

  onEsc() {
    if (this.searchText !== '') {
      this.searchText = ''
    } else {
      this.$emit('input', false)
    }
  }

}
</script>
<style lang="stylus" scoped>
.global-search
  font-size: 2em
  width: 100%
  outline: 0
</style>
