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
                                @options="options.firstName.extractOptions = $event"
                                :preloadedOptions="options.firstName.extractOptions"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <column-select
                                lemmaKey="lastName"
                                :sourceData="incommingData"
                                @data="updateData($event)"
                                @options="options.lastName.extractOptions = $event"
                                :preloadedOptions="options.lastName.extractOptions"
                            />
                        </v-col>
                        <v-col>
                            <v-alert
                                v-if="!lastNameIsFiled"
                                type="info"
                            >Dieses Feld muss ausgewählt werden</v-alert>
                        </v-col>
                    </v-row>
                </v-container>
            </v-row>
            <v-row class="data-comparision-area">
                <lemma-previewer
                    :lemmas="partialLemmaPrototypes"
                />
            </v-row>
        </v-container>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { Data2D, LemmaPrototype, createEmptyLemmaPrototype } from "@/util/lemmaimport/datacontainers";
import { ColumnConversions, defaultLemmaBuilderOptions } from "@/util/lemmaimport/options";

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
        if (this.incommingData.data.length === this.partialLemmaPrototypes.length) {
            return; // Do not loose data, if there are already the same amount of lemmas.
        }
        // Else create the right amount of empty lemma objects
        this.partialLemmaPrototypes = this.incommingData.data.map(() => new Object());
    }


    partialLemmaPrototypes: Partial<LemmaPrototype>[] = [];

    get lemmaPrototypes(): LemmaPrototype[] {
        return this.partialLemmaPrototypes.map(
            partialLemmaPrototype => {
                return {
                    // Add all properties empty
                    ... createEmptyLemmaPrototype(),
                    // And overwrite them with data
                    ... partialLemmaPrototype,
                };
            }
        );
    }

    updateData(column: Partial<LemmaPrototype>[]) {
        this.partialLemmaPrototypes = this.partialLemmaPrototypes.map(
            (newLemma, index) => {
                return {
                    ... newLemma,
                    ... column[index]
                };
            }
        );
    }

    get allRequiredFieldsSet(): boolean {
        return this.lastNameIsFiled;
    }

    get lastNameIsFiled(): boolean {
        return this.options.lastName?.extractOptions.sourceKey !== null;
    }
    
}

</script>