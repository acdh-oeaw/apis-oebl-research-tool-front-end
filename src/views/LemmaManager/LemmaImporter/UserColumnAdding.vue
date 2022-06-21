<template>
    <div class="user-columns-adding-container">
        <v-container>
            <v-row class="user-columns-adding-chosen">
                <v-col>
                    <v-chip
                        v-for="(targetColumn, sourceColumn) in localOptions"
                        :key="`${targetColumn}`"
                        close
                        @click:close="deleteMapping(targetColumn)"
                        class="chosen-user-column"
                    >
                        {{sourceColumn}}: {{targetColumn}}
                    </v-chip>
                </v-col>
            </v-row>
            <v-row class="user-columns-adding-select">
                <v-col class="user-columns-adding-select-source">
                    <v-select
                        label="Quellspalte"
                        :items="vuetifySourceColumns"
                        v-model="chosenSourceColumn"
                        clearable
                    />
                </v-col>
                <v-col class="user-columns-adding-select-target">
                    <v-text-field
                        label="Zielspalte"
                        v-model="chosenTargetColumn"
                        clearable
                        :rules="[targetColumnChosenMessage, ]"
                    />
                </v-col>
                <v-col class="user-columns-adding-select-submit">
                    <v-btn
                        @click="addUserColumn"
                        :disabled="!columnFiledsAreSet()"
                    >Hinzufügen</v-btn>
                </v-col>
            </v-row>
            <v-row class="user-columns-adding-submit">
                <v-btn
                    @click="submit"
                >Weiter</v-btn>
            </v-row>
            <v-row class="user-columns-adding-preview">
                <v-data-table
                    label="Vorschau"
                    :headers="vuetifyUserColumnHeaders"
                    :items="userColumns"
                />
            </v-row>
        </v-container>

        
    </div>
</template>
<script lang="ts">
import { NewLemmaRow, UserColumn } from "@/types/lemma";
import { Data2D } from "@/util/lemmaimport/datacontainers";
import { addUserColumns, createUserColumns } from "@/util/lemmaimport/dataconversion";
import { ColumnConversions, UserColumnMapping } from "@/util/lemmaimport/options";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

/**
 * Add custum user columns to lemmas. Called it UserColumn
 */
@Component
export default class UserColumnAdding extends Vue {

    @Prop({required: true}) preloadedOptions!: UserColumnMapping;
    @Prop({required: true}) newLemmas!: NewLemmaRow[];
    @Prop({required: true}) rawImportData!: Data2D;
    // This is needed to show the user, which columns, she/he had already chosen.
    @Prop({required: true}) columnMapping!: ColumnConversions;

    localOptions: UserColumnMapping = {};

    chosenSourceColumn?: string | null = null;
    chosenTargetColumn?: string | null = null;

    @Watch('chosenSourceColumn')
    provideTargetHint() {
        if (!this.chosenTargetColumn) {
            this.chosenTargetColumn = this.chosenSourceColumn;
        }
    }

    @Watch('preloadedOptions', {immediate: true, deep: true})
    setOptions() {
        this.localOptions = this.preloadedOptions;
    }

    @Watch('localOptions', {deep: true, immediate: true})
    @Watch('newLemmas', {deep: true, immediate: true})
    emit() {
        this.$emit('data', this.enrichedLemmas);
        this.$emit('options', this.localOptions);
    }

    submit() {
        this.$emit('submit');
    }

    deleteMapping(targetColumn: string) {
        Vue.delete(this.localOptions, targetColumn);
    }

    get vuetifySourceColumns(): Array<{
            text: string,
            value: string,
        }>  {

        const allSourceColumns: string[] = this.rawImportData.headers;
        const selectedUserSourceColumns: string[] = Object.values(this.localOptions);
        const topLevelSelectedSourceColumns: string[] = Object.values(this.columnMapping)
            .map((columnConversion): string | null | undefined => columnConversion?.extractOptions.sourceKey)
            .filter((sourceKey): sourceKey is string => typeof sourceKey === 'string')
        ;
        const selectedSourceColumns = selectedUserSourceColumns.concat(topLevelSelectedSourceColumns);
        const notSelectedSourceColumns = allSourceColumns.filter(sourceColumn => !selectedSourceColumns.includes(sourceColumn));
        return notSelectedSourceColumns.map(
            sourceColumn => {
                return {
                    text: sourceColumn,
                    value: sourceColumn
                };
            }
        );
    }

    targetColumnAlreadyChosen(targetColumn: string): boolean {
        return targetColumn in this.localOptions;
    }

    targetColumnChosenMessage(targetColumn: string): string | true {
        if (this.targetColumnAlreadyChosen(targetColumn)) {
            return 'Dieser Namen wurde schon ausgewählt';
        }
        return true;
    }

    addMapping(targetColumn: string, sourceColumn: string) {
        this.localOptions = {
            ... this.localOptions,
            [targetColumn]: sourceColumn
        };
    }

    addUserColumn() {
        if (
            (typeof this.chosenTargetColumn !== 'string')
            || (typeof this.chosenSourceColumn !== 'string')
        ) {
            return;
        }
        this.addMapping(this.chosenTargetColumn, this.chosenSourceColumn);
        this.chosenSourceColumn = null;
        this.chosenTargetColumn  = null;
    }

    columnFiledsAreSet(): boolean {
        return (typeof this.chosenTargetColumn === 'string')
                && (typeof this.chosenSourceColumn === 'string')
        ;
    }

    userColumns: UserColumn[] = [];

    @Watch('localOptions', {immediate: true, deep: true}) 
    updateUserColumns() {
        this.userColumns = createUserColumns(this.rawImportData, this.localOptions);

    }

    // https://vuetifyjs.com/en/api/v-data-table/#props-headers
    get vuetifyUserColumnHeaders(): Array<{
        text: string,
        value: string,
        sortable: boolean,
        filterable: boolean,
    }>{
        return Object.keys(this.localOptions)
            .map(
                userColumn => {
                    return {
                        text: userColumn,
                        value: userColumn,
                        sortable: false,
                        filterable: false,
                    }
                } 
            )
        ;
    }

    get enrichedLemmas(): NewLemmaRow[] {
        return addUserColumns(this.newLemmas, this.userColumns);
    }
}

</script>    