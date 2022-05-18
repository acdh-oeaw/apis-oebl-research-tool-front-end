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
                    :lemmas="lemmaPrototypes"
                />
            </v-row>
        </v-container>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { Data2D } from "@/util/lemmaimport/datacontainers";
import { ColumnConversions, defaultLemmaBuilderOptions } from "@/util/lemmaimport/options";
import { LemmaPrototype } from "@/util/lemmaimport/types";

import LemmaPreviewer from "./LemmaPreviewer.vue";
import ColumnSelect from "./ColumnSelect.vue";


/**
 * This components takes any tabular data, helps to user to map it to a LemmaPrototype, and if succesful emits an array of LemmaPrototypes.
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
        if (this.incommingData.data.length === this.lemmaPrototypes.length) {
            return; // Do not loose data, if there are already the same amount of lemmas.
        }
        // Else create the right amount of empty lemma objects
        this.lemmaPrototypes = this.incommingData.data.map(() => new Object());
    }


    lemmaPrototypes: Partial<LemmaPrototype>[] = [];

    updateData(column: Partial<LemmaPrototype>[]) {
        this.lemmaPrototypes = this.lemmaPrototypes.map(
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