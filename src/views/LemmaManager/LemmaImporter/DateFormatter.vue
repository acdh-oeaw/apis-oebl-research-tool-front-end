<template>
    
</template>
<script lang="ts">
import { factoryMethods, supportedDateFormats, SupportedDateFormatType } from '@/util/dates';
import { LemmaDates, LemmaPrototypeRequiredFieldsType } from '@/util/lemmaimport/datacontainers';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class DateFormatter extends Vue {

    @Prop({default: Array}) lemmaPrototypes!: LemmaPrototypeRequiredFieldsType[];
    @Prop({required: true}) preloadedDateFormatOption!: SupportedDateFormatType;

    supportedDateFormats: SupportedDateFormatType[] = supportedDateFormats;
    localDateFormat: SupportedDateFormatType = supportedDateFormats[0];

    created() {
        this.localDateFormat = this.preloadedDateFormatOption;
    }

    get dates(): LemmaDates[] {
        const factoryMethod = factoryMethods[this.localDateFormat];
        return this.lemmaPrototypes.map(
            lemmaPrototype => {
                return {
                    dateOfBirth: factoryMethod(lemmaPrototype.dateOfBirth),
                    dateOfDeath: factoryMethod(lemmaPrototype.dateOfDeath),
                };
            }
        );
    }

    @Watch('dates', {immediate: true, deep: true})
    @Watch('options', {immediate: true, deep: true})
    submit() {
        this.$emit('options', this.localDateFormat);
        this.$emit('data', this.dates);
    }

}

</script>