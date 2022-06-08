<template>
    <div class='import-options-saver-container'>
        <v-container>
            <v-row>
                <v-col>
                    <v-btn
                        icon
                        :disabled="!changedByUserInteraction || currentlySaving || !optionsReady || disabled || !';-)'"
                        @click="currentlySaving = true"
                    >Importeinstellungen speichern</v-btn>
                </v-col>
                <v-col>
                    <div 
                        v-if="currentlySaving"
                        class="saving-options-dialog"
                    >
                        <v-combobox
                            label="Name"
                            v-model="newOptionsName"
                            :items="optionsNames"
                            @input="saveOption"
                        />
                    </div>
                    <div
                        v-else-if="optionsNames.length > 0" 
                        class="load-options-dialog"
                    >
                        <v-select
                            label="Einstellungen laden"
                            v-model="newOptionsName"
                            :items="optionsNames"
                            :disabled="disabled"
                        />
                        <v-btn
                                v-if="newOptionsName"
                                @click="loadOption"
                                icon
                            >
                            <v-icon>
                                mdi-check
                            </v-icon>
                        </v-btn>
                    </div>
                </v-col>
                <v-col>
                    <div
                        class="currently-loaded-import-options-name"
                        v-if="selectedOptionsName"
                    >{{selectedOptionsName}}</div>
                </v-col>
            </v-row>
        </v-container>        
    </div>
</template>

<script lang='ts'>
import { ImportOptionsManager } from '@/util/lemmaimport/optionmanagement';
import { ImportOptions } from '@/util/lemmaimport/options';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class ImportOptionsSaver extends Vue {

    @Prop({required: true}) globalOptions!: ImportOptions;
    @Prop({default: false}) disabled!: boolean;

    importOptionsManager: ImportOptionsManager = new ImportOptionsManager();

    selectedOptionsName: string|null|undefined = null;

    newOptionsName: string|null|undefined = null;

    localOptions: ImportOptions = new ImportOptions();

    errorMessage: string|null = null;

    optionsChangedByLoading: boolean = false;

    currentlySaving = false;

    @Watch('globalOptions', {deep: true, immediate: true})
    updateLocalOptions() {
        this.localOptions = this.globalOptions;
    }

    changedByUserInteraction: boolean = false;

    @Watch('localOptions', {immediate: true, deep: true})
    setChanged() {
        if (this.optionsChangedByLoading) {
            this.$emit('options', this.localOptions);
            // These are not the user selected options anymore.
            this.optionsChangedByLoading = false;
            // These are 
            this.changedByUserInteraction = false;
            return;
        } else {
            this.changedByUserInteraction = true;
        }
    }

    optionsNames: string[] = [];

    updateOptionsNames(): void {
        this.optionsNames = this.importOptionsManager.listImportOptionsNames();
    }

    loadOption() {
        if ((this.newOptionsName === null) || (this.newOptionsName === undefined)) {
            console.error('Can not save with no options name defined.');
            return;
        }
        try {
            this.localOptions = this.importOptionsManager.getImportOptionByName(this.newOptionsName);
            
        } catch (error) {
            this.errorMessage = `${this.newOptionsName} konnte nicht geladen werden`;
            this.newOptionsName = null;
        } finally {
            
            this.optionsChangedByLoading = true;
            this.selectedOptionsName = this.newOptionsName;
            this.newOptionsName = null;
        }
    }

    saveOption() {
        if ((this.newOptionsName === null) || (this.newOptionsName === undefined)) {
            console.error('Can not save with no options name defined.');
            return;
        }
        this.importOptionsManager.addOrUpdateImportOptions(this.newOptionsName, this.localOptions);
        this.selectedOptionsName = this.newOptionsName;
        this.newOptionsName = null;
        this.currentlySaving = false;
        this.updateOptionsNames();
    }

    get optionsReady(): boolean {
        return this.globalOptions.allIsFilledIn();
    }

    created() {
        this.updateOptionsNames();
    }


}

</script>