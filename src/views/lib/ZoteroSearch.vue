<template>
    <div class=zotero-search-container>
        <v-autocomplete
            :error-messages="zoteroErrorMessages"
            :items="filteredAndFormattedZoteroResults"
            :search-input.sync="searchTerm"
            label="Aus Zotero hinzufügen"
            :loading="loading"
            @upddate:search-input="searchTerm = $event"
            @input="submitItem($event)"
            no-data-text="Bitte geben Sie einen Suchbegriff ein"
        ></v-autocomplete>
    </div>
</template>
<script lang="ts">

import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import zoteroStore from '@/service/zotero';
import { ZoteroItem } from '@/types/zotero';


/**
 * Search And Select Citations From Zotero
 * 
 * Emits ZoteroItem
 */
@Component
export default class ZoteroSearch extends Vue {

    @Prop({ default: []}) exclude!: ZoteroItem[];

    searchTerm: string|null|undefined = '';
    zoteroResults: ZoteroItem[] = [];
    zoteroErrorMessages: string[] = [];
    loading: boolean = false;

    clearZoteroResults(): void {
        this.zoteroResults = [];
    }

    @Watch('searchTerm')
    populateZoteroResults(): void {
        if ((this.searchTerm === null) || (this.searchTerm === undefined)) {
            return;
        }
        const searchTerm = this.searchTerm.trim();
        if (searchTerm.length === 0) {
            return;
        }
        this.loading = true;
        zoteroStore.searchItem(this.searchTerm)
            .then(
                (zoteroItems: ZoteroItem[]) => {
                    this.zoteroResults = zoteroItems;
                    this.zoteroErrorMessages = [];
                    this.loading = false;
                }
            )
            .catch(
                (event) => {
                    this.loading = false;
                    this.zoteroResults = [];
                    this.zoteroErrorMessages.push(event.message);
                }
            )
    }

    get filteredAndFormattedZoteroResults(): Array<{value: string, text: string}> {
        const exclude_keys = this.exclude.map((zoteroItem: ZoteroItem) => zoteroItem.key);
        const filteredResults = this.zoteroResults.filter((zoteroItem: ZoteroItem) => !exclude_keys.includes(zoteroItem.key));
        return filteredResults.map(
            (zoteroItem) => {
                return { value: zoteroItem.key, text: `${zoteroItem.data.title}, ${zoteroItem.data.date ? zoteroItem.data.date: 'o. J.'}`}
                }
        );
    }

    submitItem(zoteroKey: string) {
        const zoteroItem = this.zoteroResults.find(zoteroItem => zoteroItem.key === zoteroKey);
        if (zoteroItem === undefined) {
            throw new Error(`Could not find selected zoteroItem with Key ${zoteroKey} from auto-complete in auto-complete list.`)
        }
        this.$emit('submit', zoteroItem);
    }
}

</script>