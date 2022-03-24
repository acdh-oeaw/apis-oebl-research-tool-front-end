<template>
  <text-field 
  :label="label"
  @input="emitDate()"
  >
    <template v-slot:input>
      <div class="outer">
        <div
          v-if="errorMessage" 
          class="error-message">
          {{ errorMessage }}
        </div>
        <input
          min="1"
          :max="localDate.getMaxDate()"
          maxlength="2"
          v-model="localDate.calendarDay"
          class="pa-1 text--primary"
          style="width: 40px"
          placeholder="TT"
        />
        <input
          maxlength="2"
          min="1"
          max="12"
          v-model="localDate.calendarMonth"
          class="pa-1 text--primary"
          style="width: 40px"
          placeholder="MM"
        />
        <input
          minlength="4"
          maxlength="4"
          v-model="localDate.calendarYear"
          class="pa-1 text--primary"
          style="width: 50px"
          placeholder="JJJJ"
          />
          <v-spacer></v-spacer>
          <v-btn
            @click="localDate.reset()"
            icon
            >
            <v-icon>mdi-close-circle-outline</v-icon>
            </v-btn>
      </div>
    </template>
    <slot />
  </text-field>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import TextField from './TextField.vue'
import { DateContainer } from '@/util/dates';


@Component({
  components: {
    TextField,
  }
})
export default class DateField extends Vue {

  @Prop({ default: null }) label!: string|null;
  @Prop( ) date!: DateContainer;

  localDate: DateContainer = new DateContainer();
  
  @Watch('date', {immediate: true, deep: true})
  updateLocalDate() {
    if (!this.localDate.equals(this.date)) {
      this.localDate = this.date;
    }
  }

  get errorMessage(): string|undefined {
    if (
      this.localDate.calendarYear === undefined
      || this.localDate.calendarMonth === undefined
      || this.localDate.calendarDay === undefined
    ) {
      return undefined;
    }

    if (
      (this.localDate.calendarMonth < 1 )
      || (this.localDate.calendarMonth > 12 )
    ) {
      return 'Bitte einen Monat zwischen 1 und 12 auswählen.';
    }

    if (
      (this.localDate.calendarDay < 1 )
      || (this.localDate.calendarDay > this.localDate.getMaxDate())
    ) {
      return `Bitte einen Tag zwischen 1 und ${this.localDate.getMaxDate()} auswählen.`
    }
 
    if (!this.localDate.isValid()) {
      console.error({message: 'Logic in error, check object', object: this});
      return 'Bitte ein existierendes Datum auswählen';
    }

    return undefined;
  }
  

  emitDate() {
    if (
      this.localDate.calendarYear === undefined
      || this.localDate.calendarMonth === undefined
      || this.localDate.calendarDay === undefined
    ) {
      return;
    }
    this.$emit('submit', this.localDate);
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
