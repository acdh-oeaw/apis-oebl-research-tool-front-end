<template>
    <div class="column-select">
        <v-container>
            <v-row>
                <v-col>{{label}}</v-col>
                <v-col>
                    <v-select
                        label="Quellspalte"
                        v-model="options.sourceKey"
                        :items="vuetifySelectItems"
                    />
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script lang="ts">
import { lemmaRowTranslations } from '@/util/labels';
import { LemmaRow } from '@/types/lemma';
import { Data2D } from '@/util/lemmaimport/datacontainers';
import { ExtractColumnOptions } from '@/util/lemmaimport/options';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class ColumnSelect extends Vue {

    @Prop() lemmaKey!: keyof LemmaRow;
    @Prop() sourceData!: Data2D;
    @Prop() preloadedOptions!: ExtractColumnOptions;

    options: ExtractColumnOptions = {sourceKey: null, };
    label: string = '';

    created() {
        // This is not real reactive, only at startup, so no Watch
        this.options = this.preloadedOptions;
        this.label = lemmaRowTranslations[this.lemmaKey].de;
    }


    get extractedData(): Partial<LemmaRow>[] {
        if (this.options.sourceKey === null) {
            return [];
        }

        const column = this.sourceData.selectByHeaderName(this.options.sourceKey);
        return column.map(
            value => {
                return {
                    [this.lemmaKey]: value 
                };
            }
        );
    }

    @Watch('selectedSourceKey', {immediate: false, deep: true}) // deeeeep
    @Watch('options', {immediate: false, deep: true})
    emitExtraction() {
        this.$emit('options', this.options);
        this.$emit('data', this.extractedData);
    }

    // https://vuetifyjs.com/en/api/v-select/#props-items
    get vuetifySelectItems() {
        return this.sourceData.headers.map(
            header => {
                return {
                    text: header,
                    value: header,
                };
            }
        );
    } 

}

</script>