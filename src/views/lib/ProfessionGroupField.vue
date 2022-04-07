<template>
    <div class="outer profession-group">
        <v-autocomplete
            v-model="localSelected"
            :loading="loading"
            :items="searchResults"
            :search-input.sync="searchTerm"            
            :error-messages="errorMessages"
            cache-items
            label="Berufsgruppe"
            no-data-text="Bitte geben Sie einen Suchbegriff ein"
        ></v-autocomplete>

    </div>
</template>
<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { OpenAPI } from '@/api/core/OpenAPI'
import { ProfessionGroup } from '@/api';
import { isEmpty, toNumber } from 'lodash';


interface VAutoComplete {
    id?: number,
    value: string,
    text: string,
}

interface ServerAutoCompleteResult {
    id: string, 
    text: string, 
    selected_text: string,
}

interface ServerAutoCompleteResultSet {
    results: Array<ServerAutoCompleteResult>,
}


function convertVAutoCompleteToProfessionGroup(vAutoComplete: VAutoComplete|null|undefined): ProfessionGroup | null {
    if ((vAutoComplete === null)||(vAutoComplete == undefined)) {
        return null;
    }
    return {id: vAutoComplete.id, name: vAutoComplete.text};
}


function convertServerAutoCompleteResultToVAutoComplete(serverAutoCompleteResult: ServerAutoCompleteResult): VAutoComplete {
    return {id: toNumber(serverAutoCompleteResult.id), value: serverAutoCompleteResult.text, text: serverAutoCompleteResult.text};
}

function convertServerAutoCompleteResultProfessionGroup(serverAutoCompleteResult: ServerAutoCompleteResult): ProfessionGroup {
    return {id: toNumber(serverAutoCompleteResult.id), name: serverAutoCompleteResult.text};
}

/**
 * Search And Select Profession Groups From Django Server
 * 
 * Emits Profession Group
 */
@Component
export default class ProfessionGroupField extends Vue {
    
    @Prop({default: null}) selected!: ProfessionGroup | null;


    searchTerm: string = '';
    localSelected: string|null = null;
    searchResults: Array<VAutoComplete> = [];
    professionGroupCache: ProfessionGroup[] = [];
    loading: boolean = false;
    errorMessages: string[] = [];


    @Watch('selected', {immediate: true, deep: false})
    setLocalSelected() {
        if (this.selected === null) {
            return;
        }
        this.professionGroupCache.push(this.selected)
        this.localSelected = this.selected.name;
    }

    @Watch('localSelected', {immediate: false, deep: true})
    emitSelection() {
        const localSelected = this.findProfessionGroup();

        if (localSelected === undefined) {
            console.error(
                {
                    message: 'Could not find professionGroup AutoComplete Result from search term.',
                    localSelected: this.localSelected,
                    searchResults: this.searchResults,
                    searchTerm: this.searchTerm,
                }
            );
            return;
        }


        if (
            this.selected !== null
            && localSelected.id === this.selected.id
            ) {            
            return;
        }

        this.$emit('input', localSelected);
    }

    @Watch('searchTerm', {immediate: false, deep: false})
    populateSearchResults() {
        if (!this.searchTerm) {
            return;
        }
        if (this.searchTerm === this.localSelected) {
            return;
        }
        const url = new URL(`${OpenAPI.BASE}/research/api/v1/autocompletes/professiongroup/`);
        url.searchParams.set('q', this.searchTerm);
        this.loading = true;
        const fetching = fetch(url.toString());
        fetching.catch(reason => {
            this.errorMessages.push(`Ergebnisse konnten nicht geladen werden: ${reason}`);
            console.error({message: 'Could not load profession group auto complete', reason})
            this.loading = false;
            }
        );
        fetching.then(
            (response: Response) => {
                this.errorMessages = [];
                response.json().then(
                    (data: ServerAutoCompleteResultSet) => {
                        this.loading = false;
                        this.searchResults = data.results.map(convertServerAutoCompleteResultToVAutoComplete);
                        this.professionGroupCache = this.professionGroupCache.concat(data.results.map(convertServerAutoCompleteResultProfessionGroup));
                    }
                )
            }
        )
        ;
    }

    findProfessionGroup(): ProfessionGroup | undefined {
        return this.professionGroupCache.find(professionGroup => professionGroup.name === this.localSelected);
    }
}


</script>