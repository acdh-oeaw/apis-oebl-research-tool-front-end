<template>
    <div class="gender-mapper-container">
        
    </div>
</template>
<script lang="ts">
import { LemmaGender, LemmaPrototypeRequiredFieldsType } from '@/util/lemmaimport/datacontainers';
import { mapGender } from '@/util/lemmaimport/dataconversion';
import { defautLemmaFormatterOptions, GenderMappingOption } from '@/util/lemmaimport/options';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class GenderMapper extends Vue {

    @Prop({required: true}) preloadedOptions!: GenderMappingOption;
    @Prop({default: Array}) lemmaPrototypes!: LemmaPrototypeRequiredFieldsType[];
    
    localOptions: GenderMappingOption = defautLemmaFormatterOptions.genderMapping;

    created() {
        this.localOptions = this.preloadedOptions;
    }

    get genders(): Array<LemmaGender> {
        return this.lemmaPrototypes.map(
            lemma => {
                return {
                    gender: mapGender(lemma.gender, this.localOptions),
                };
            }
        );
    }

    @Watch('localOptions', {deep: true, immediate: true})
    @Watch('lemmaPrototypes', {deep: true, immediate: true})
    submit() {
        this.$emit('options', this.localOptions);
        this.$emit('data', this.genders);
    }

}

</script>