    <template>
    <div class="lemma-builder-container">
        <v-container>
            <v-row class="lemma-builder-ux">
                <v-col>
                    <v-expansion-panels multiple>
                        <v-expansion-panel
                            v-for="(columns, groupName) in columnGroups"
                            :key="groupName"
                            class="import-column-select-group"
                            >
                            <v-expansion-panel-header 
                                :class="'import-column-select-group-name' + (groupHasMissingRequiredValue(groupName) ? ' warning' : '')"
                                >{{groupName}}</v-expansion-panel-header>
                            <v-expansion-panel-content eager>
                                <v-container>
                                    <v-row
                                        v-for="(column, index) in columns"
                                        :key="`${column}-${index}`"
                                    >
                                        <v-col>
                                            <column-select
                                                :lemmaKey="column.name"
                                                :sourceData="incommingData"
                                                @options="setOptionsByName(column.name, $event)"
                                                @cancel="removeData(column.name)"
                                                @data="updateData($event)"
                                                :preloadedOptions="getOptionsByName(column.name)"
                                            />
                                        </v-col>
                                        <v-col>
                                            <div
                                                v-if="column.required && getOptionsByName(column.name).sourceKey === null"
                                                class="missing-required-field-column-select"
                                            >
                                                <v-alert type="warning">Dieses Feld muss ausgefüllt werden</v-alert>
                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-col>
            </v-row>
            <v-row class="submit-column-selects">
                <v-col>
                    <v-btn
                        :disabled="!allRequiredFieldsSet"
                        @click="submit"
                        >Weiter</v-btn>
                </v-col>
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

import { Data2D, LemmaPrototypeStringType } from "@/util/lemmaimport/datacontainers";
import { ColumnConversion, ColumnConversions, defaultLemmaBuilderOptions, ExtractColumnOptions, getEmptyColumnConversion } from "@/util/lemmaimport/options";

import LemmaPreviewer from "./LemmaPreviewer.vue";
import ColumnSelect from "./ColumnSelect.vue";
import { createEmptyLemmaPrototype } from "@/util/lemmaimport/dataconversion";


type ColumnGroups = {
    [groupName: string]: Array<{name: keyof ColumnConversions, required?: boolean}>;
};


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
    // Interdmidiate lemma prototypes, before they are ready to submit
    partialLemmaPrototypes: Partial<LemmaPrototypeStringType>[] = [];
    // Result to emit
    lemmaPrototypes: LemmaPrototypeStringType[] = [];

    // Used to display column selections in an structured way.
    get columnGroups(): ColumnGroups {
        return {
            "Basisdaten": [
                {name: "firstName"}, {name: "lastName", required: true},
                {name: "dateOfBirth"}, {name: "dateOfDeath"},
                {name: "gender"},
            ],
            "Erweiterte Daten": [
                {name: "professionDetail"}, {name: "bioNote"}, {name: "kinship"}, {name: "religion"},
            ],
            "Linked Data": [
                {name: "gnd"}, {name: "loc"}, {name: "viaf_id"},
            ],
        }
    }

    get allRequiredFieldsSet(): boolean {
        for (const groupName in this.columnGroups) {
            if (this.groupHasMissingRequiredValue(groupName)) {
                return false;
            }
        }
        return true;

    }

    // Update local options, when preloaded options change.
    @Watch('preloadedOptions', {immediate: true, deep: true})
    setOptions() {
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

    @Watch('lemmaPrototypes', {immediate: true, deep: true})
    @Watch('options', {immediate: false, deep: true})
    emit() {

        this.$emit('options', this.options);
        this.$emit('data', this.lemmaPrototypes);
    }


    @Watch('partialLemmaPrototypes', {immediate: true, deep: false})
    @Watch('options', {immediate: false, deep: true})
    updateLemmaPrototypes() {
        // if it is not possible to compute any lemma prototype -> go empty list => empty preview and computations in the next components.
        if (!this.allRequiredFieldsSet && this.lemmaPrototypes !== []) {
            this.lemmaPrototypes = [];
        }

        this.lemmaPrototypes = this.partialLemmaPrototypes.map(
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

    submit() {
        this.$emit('submit');
    }
    
    updateData(column: Partial<LemmaPrototypeStringType>[]) {
        this.partialLemmaPrototypes = this.partialLemmaPrototypes.map(
            (newLemma, index) => {
                return {
                    ... newLemma,
                    ... column[index]
                };
            }
        );
    }

    removeData(columnName: string) {
        this.partialLemmaPrototypes.forEach(
            partialLemmaPrototype => delete(partialLemmaPrototype[columnName as keyof Partial<LemmaPrototypeStringType>])
        )
    }
     
    getOptionsByName(name: keyof ColumnConversions): ExtractColumnOptions {
        return this.options[name]?.extractOptions ?? getEmptyColumnConversion().extractOptions;
    }

    setOptionsByName(name: keyof ColumnConversions, option: ExtractColumnOptions) {
        /*
         * Could not get a more simple typeguard to work here – maybe I am to much of a full stack dev, to find a better solution.
         */
        const storedColumnConversion: ColumnConversion|undefined = this.options[name];
        const columnConversionInUse: ColumnConversion = storedColumnConversion ?? getEmptyColumnConversion();
        if (storedColumnConversion === undefined) {
            this.options[name] = columnConversionInUse;
        }
        columnConversionInUse.extractOptions = option;
        // Trigger vue watch. Apperently, the above does not, event though it is deep.
        this.options[name] = columnConversionInUse;
    }

    groupHasMissingRequiredValue(group: string): boolean {
        const columnConversions = this.columnGroups[group];
        if (columnConversions === undefined) {
            return false;
        }
        const requiredColumns = columnConversions.filter(columnConversion => columnConversion.required);
        if (requiredColumns.length === 0) {
            return false;
        }

        for (const requiredColumn of requiredColumns) {
            const option = this.options[requiredColumn.name];
            if (option === undefined || option.extractOptions.sourceKey === null) {
                return true;
            }
        }

        return false;
    }

}

</script>