<template>
    <div class="lemma-formatter-container">
        <v-expansion-panels>
            <v-expansion-panel class="null-managment-row">
                <v-expansion-panel-header>Null-Werte</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <null-manager
                        :lemmaPrototypes="lemmaPrototypes"
                        :preloadedNullValues="localOptions.nullValues"
                        @options="localOptions.nullValues = $event"
                        @data="lemmasPrototypesWithNullsAndRequiredFields = $event"
                    />
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>

<script lang="ts">

import { LemmaRow } from "@/types/lemma";
import { LemmaPrototypeStringType, LemmaPrototypeRequiredFieldsType } from "@/util/lemmaimport/datacontainers";
import { LemmaFormatterOptions, defautLemmaFormatterOptions } from "@/util/lemmaimport/options";
import { Component, Prop, Vue } from "vue-property-decorator";
import NullManager from "./NullManager.vue";


/**
 * Takes LemmaPrototypes And Converts Them To LemmaRows
 */
@Component({
    components: {
        NullManager,  
    },
})
export default class LemmaFormatter extends Vue {

    @Prop({required: true, default: Array}) lemmaPrototypes!: LemmaPrototypeStringType[];
    @Prop({required: true }) preloadedOptions!: LemmaFormatterOptions;

    localOptions: LemmaFormatterOptions = defautLemmaFormatterOptions;

    created() {
        this.localOptions = this.preloadedOptions;
    }

    lemmasPrototypesWithNullsAndRequiredFields: LemmaPrototypeRequiredFieldsType[] = [];

    newLemmas: LemmaRow[] = [];

    submit() {
        this.$emit('data', this.newLemmas);
        this.$emit('options', this.localOptions);
        this.$emit('submit');
    }



}

</script>