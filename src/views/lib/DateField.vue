<template>
  <text-field :label="label">
    <template v-slot:input>
      <div class="outer">
        <div
          v-if="errorMessage" 
          class="error-message">
          {{ errorMessage }}
        </div>
        <input
          min="1"
          :max="maxDay"
          maxlength="2"
          :value="localDay"
          class="pa-1 text--primary"
          style="width: 40px"
          placeholder="TT"
        />
        <input
          maxlength="2"
          min="1"
          max="12"
          :value="localMonth"
          class="pa-1 text--primary"
          style="width: 40px"
          placeholder="MM"
        />
        <input
          minlength="4"
          maxlength="4"
          :value="localYear"
          class="pa-1 text--primary"
          style="width: 50px"
          placeholder="JJJJ"
          />
      </div>
    </template>
    <slot />
  </text-field>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import TextField from './TextField.vue'
import SelectMenu from './SelectMenu.vue'
import parseISO from 'date-fns/parseISO';
import isValid from 'date-fns/isValid';
import getDaysInMonth from 'date-fns/fp/getDaysInMonth';


@Component({
  components: {
    TextField,
    SelectMenu
  }
})
export default class DateField extends Vue {

  @Prop({ default: null }) label!: string|null;
  @Prop( ) date!: Date | null;

  localDay: number = 1;
  localMonth: number = 1;
  localYear: number = 0;
  errorMessage: string|null = null;

  @Watch('date', {immediate: true, deep: true})
  updateLocalDate() {
    // Fallback for wrong types
    if (this.date instanceof Date) {
      this.localYear = this.date.getUTCFullYear();
      this.localMonth = this.date.getUTCMonth() + 1; // "a zero-based value" https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getUTCMonth
      this.localDay = this.date.getUTCDate();
    }
  }

  @Watch('localDay', {immediate: false, deep: false})
  @Watch('localMonth', {immediate: false, deep: false})
  @Watch('localYear', {immediate: false, deep: false})
  processDateInput() {

    const parseAttempt = parseISO(`${this.localYear}-${this.localMonth}-${this.localDay}`, {additionalDigits: 0});

    if (isValid(parseAttempt)) {
      this.errorMessage = null;
      this.$emit('input', parseAttempt);
      return;
    }
    this.errorMessage = 'Bitte ein korrektes Datum eingeben';
  }

  get maxDay(): number {
      const parseAttempt = parseISO(`${this.localYear}-${this.localMonth}-1`, {additionalDigits: 0});
      
      if (isValid(parseAttempt)) {
        return getDaysInMonth(parseAttempt);
      }
      
      return 31;
  }



}
</script>
<style lang="stylus" scoped>
.outer
  display flex
  height 100%
input
  text-align center
</style>
<style lang="stylus">
.modifier-menu
  width: 62px
</style>
