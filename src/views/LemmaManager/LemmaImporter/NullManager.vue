<template>
    <div class="null-manager-container">
        <v-container>
            <v-row class="null-managment-options">
                <v-col>
                    <v-autocomplete
                        multiple
                        v-model="localNullValues"
                        :items="vuetifyNullSelect"
                        label="Nullwerte"
                        deletable-chips
                        small-chips
                    />
                </v-col>
            </v-row>
            <v-row class="fields-missing" v-if="nullPrototypes.length">
                <v-col>
                    <lemma-previewer
                        :lemmas="nullPrototypes"
                        label="Lemmas ohne Nachname können nicht importiert werden."
                    />
                </v-col>
            </v-row>
            <v-row class="nulled-result">
                <v-col>
                    <lemma-previewer
                        :lemmas="lemmaPrototypesWithRequiredFields"
                        label="Diese Lemmas werden importiert."
                    />
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script lang="ts">
import { LemmaPrototypeStringType, LemmaPrototypeNullableStringType, LemmaPrototypeRequiredFieldsType } from "@/util/lemmaimport/datacontainers";
import { filterMissingRequiredFields, getMissingRequiredFieldIndexes, replaceNullStrings, showMissingRequiredFields } from "@/util/lemmaimport/dataconversion";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import LemmaPreviewer from "./LemmaPreviewer.vue";

@Component({
    components: {
        LemmaPreviewer,
    },
})
export default class NullManager extends Vue {

    @Prop({required: true}) lemmaPrototypes!: LemmaPrototypeStringType[];
    @Prop({required: true}) preloadedNullValues!: string[];
    
    localNullValues: string[] = [];

    @Watch('preloadedNullValues', {immediate: true, deep: true})
    setLocalOptions() {
        this.localNullValues = this.preloadedNullValues;
    }

    get lemmasWithNulls(): LemmaPrototypeNullableStringType[] {
        return this.lemmaPrototypes.map(
            lemmaPrototype => replaceNullStrings(lemmaPrototype, this.localNullValues)
        );
    }

    get lemmaPrototypesWithRequiredFields(): LemmaPrototypeRequiredFieldsType[] {
        return filterMissingRequiredFields(this.lemmasWithNulls);
    }

    get nullPrototypes(): LemmaPrototypeNullableStringType[] {
        return showMissingRequiredFields(this.lemmasWithNulls);
    }

    get missingRequiredFieldIndexes(): number[] {
        return getMissingRequiredFieldIndexes(this.nullPrototypes);
    }

    @Watch('options', {deep: true, immediate: true})
    @Watch('lemmaPrototypesWithRequiredFields', {deep: true, immediate: true})
    submit() {
        this.$emit('options', this.localNullValues);
        this.$emit('data', this.lemmaPrototypesWithRequiredFields);
        this.$emit('missingRowsIndexes', this.missingRequiredFieldIndexes);
    }

    // https://vuetifyjs.com/en/api/v-autocomplete/#props-items
    get vuetifyNullSelect() {
        return this.localNullValues.map(
            nullValue => {
                return {
                    text: JSON.stringify(nullValue),
                    value: nullValue,
                };
            }
        );
    }

}

</script>
