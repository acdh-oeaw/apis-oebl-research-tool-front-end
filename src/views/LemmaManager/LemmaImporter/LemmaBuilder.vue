<template>
    <div class="lemma-builder-container">
        <v-container>
            <v-row class="lemma-builder-ux">
                <v-container>
                    <v-row>
                        <v-col>
                            <column-select
                                lemmaKey="firstName"
                                :sourceData="incommingData"
                                @data="updateData($event)"
                                @options="options.firstName = $event"
                                :preloadedOptions="options.firstName"
                            />
                        </v-col>
                    </v-row>
                </v-container>
            </v-row>
            <v-row class="data-comparision-area">
                <lemma-previewer
                    :lemmas="newLemmas"
                />
            </v-row>
        </v-container>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { Data2D } from "@/util/lemmaimport/datacontainers";
import { ColumnConversions, defaultLemmaBuilderOptions } from "@/util/lemmaimport/options";
import { LemmaRow } from "@/types/lemma";

import LemmaPreviewer from "./LemmaPreviewer.vue";
import ColumnSelect from "./ColumnSelect.vue";


/**
 * This components takes any tabular data, helps to user to map it to a LemmaRow, and if succesful emits an array of LemmaRows.
 */
@Component(
    {
        components: {
            LemmaPreviewer,
            ColumnSelect,
        }
    }
)
export default class LemmaBuilder extends Vue {
    
    @Prop() incommingData!: Data2D;
    @Prop() preloadedOptions!: ColumnConversions;

    options: ColumnConversions = defaultLemmaBuilderOptions;

    created() {
        // This is not real reactive, only at startup, so no Watch
        this.options = this.preloadedOptions;
    }

    @Watch('incommingData', {immediate: true, deep: true})
    createEmptyLemmas() {
        if (this.incommingData.data.length === this.newLemmas.length) {
            return; // Do not loose data, if there are already the same amount of lemmas.
        }
        // Else create the right amount of empty lemma objects
        this.newLemmas = this.incommingData.data.map(() => new Object());
    }


    newLemmas: Partial<LemmaRow>[] = [];

    updateData(column: Partial<LemmaRow>[]) {
        this.newLemmas = this.newLemmas.map(
            (newLemma, index) => {
                return {
                    ... newLemma,
                    ... column[index]
                };
            }
        );
    }
}

</script>