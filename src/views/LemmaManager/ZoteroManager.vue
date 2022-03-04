<template>
    <v-card class="transparent" flat >
        <v-card-title class="zotero-list-title pb-0">
            {{ listName }} Lemma 

            <span v-if="zoteroLemmaManagmentController.loading" class="loading-zotero">
                …
            </span>
            <span v-else class="zotero-results">{{this.zoteroItems.length}}</span>
            <div class="add-more-zotero-items">
                <zotero-search
                :exclude="zoteroItems"
                @submit="addNewZoteroItem($event)"
                ></zotero-search>
            </div>
        </v-card-title>
        <div v-if="detailedView" class="detailed-zotero-view">
            
            <v-card-text class="pt-0 pl-2" >
                <v-list class="zotero-citation-list pt-0" dense>
                    <v-list-item
                        v-for="(zoteroView, key) in zoteroItemsView"
                        :key="key"
                    >
                    {{ zoteroView.citation }}
                        <v-btn
                            :href="zoteroView.url"
                            target="_blank"
                            icon
                            x-small
                            class="pl-1"
                        >
                            <v-icon x-small>mdi-open-in-new</v-icon>
                        </v-btn>
                    </v-list-item>
                </v-list>
            </v-card-text>
        </div>
    </v-card>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';


interface ZoteroView {
    citation: string,
    url?: string,
}

import { ZoteroLemmaManagmentController  } from '@/service/zotero';
import { ZoteroItem } from '@/types/zotero';
import ZoteroSearch from '@/views/lib/ZoteroSearch.vue';

/**
 * Manage Zotero Items from and about a lemma (https://gitlab.com/acdh-oeaw/oebl/oebl-research-tool-front-end/-/issues/17):
 * 
 * - List items
 * - … more to come
 */
@Component({
    components: {
        ZoteroSearch
    }
})
export default class ZoteroManager extends Vue {

    @Prop({ default: () => []}) zoteroKeysFromServer!: string[];
    @Prop() lemmaName!: string;
    @Prop() listName!: string;

    detailedView: boolean = true;

    zoteroItems: Array<ZoteroItem> = [];
    zoteroLemmaManagmentController: ZoteroLemmaManagmentController = new ZoteroLemmaManagmentController(this.zoteroKeysFromServer);

    created() {
        this.zoteroLemmaManagmentController.load().then(
                (zoteroLemmaManagmentController) => {
                    this.zoteroItems = zoteroLemmaManagmentController.zoteroItems;
                    zoteroLemmaManagmentController.update().then(
                        (zoteroLemmaManagmentController) => {
                            this.zoteroItems = zoteroLemmaManagmentController.zoteroItems;
                        }
                    )
                }
            );
        ;
    }

    addNewZoteroItem(zoteroItem: ZoteroItem) {
        // Early return if zoteroItem aleady in component
        if (this.zoteroItems.find(zoteroArrayItem => zoteroArrayItem.key === zoteroItem.key) !== undefined) {
            return;
        }
        // Keep track of items in component
        this.zoteroItems.push(zoteroItem);
        // Add items to cache:
        this.zoteroLemmaManagmentController.add([zoteroItem]);
        // Notify parent component of new zoteroItems
        this.$emit('submit', this.zoteroItems.map(item => item.key));
    }

    get zoteroItemsView(): Array<ZoteroView> {
        return this.zoteroItems.map(
            (zoteroItem: ZoteroItem): ZoteroView => {
                const authors = zoteroItem.data.creators.map(creator => creator.lastName).join(', ');
                const title = zoteroItem.data.title;
                const year = zoteroItem.data.date ? zoteroItem.data.date: 'o. J.';
                return {
                    citation: `${authors}: ${title}, ${year}`,
                    url: zoteroItem.links?.alternate.href,
                }
            }
        );
    } 


}

</script>
<style scoped >

    .loading-zotero {
        margin: 0 1em 0 1em;
    }

    .zotero-results {
        padding: 0;
        margin: 0;
    }

    .zotero-results::before {
        margin-left: 1em;
        content: '(';
    }
     
    .zotero-results::after {
        content: ')';
    }

    .zotero-list-title {
        font-size: 100%;
        font-weight: 500;
    }
</style>
