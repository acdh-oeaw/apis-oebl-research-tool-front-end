<template>
    <v-expansion-panel class="transparent">
        <v-expansion-panel-header>
            {{ title }} ({{ zoteroItems.length }})
            </v-expansion-panel-header>
        <div class="add-more-zotero-items">
            <zotero-search
                :exclude="zoteroItems"
                @submit="addNewZoteroItem($event)"
            ></zotero-search>
        </div>
        <v-expansion-panel-content>
            <ul class="zotero-citation-list">
                <li
                    v-for="(zoteroView, key) in zoteroItemsView"
                    :key="key"
                >
                    <a :href="zoteroView.url" target="_blank">{{ zoteroView.title }}</a>
                </li>
            </ul>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';


interface ZoteroView {
    title: string,
    url: string,
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
    @Prop({ default: 'Zotero Literatur' }) title!: string;

    zoteroItems: Array<ZoteroItem> = [];
    zoteroLemmaManagmentController: ZoteroLemmaManagmentController = new ZoteroLemmaManagmentController(this.zoteroKeysFromServer);

    created() {
        this.zoteroLemmaManagmentController.load().then(
                (zoteroLemmaManagmentController) => {
                    if (zoteroLemmaManagmentController.zoteroItems === undefined) {
                        throw new Error(`Could not load zoteroItems`);
                    }
                    this.zoteroItems = zoteroLemmaManagmentController.zoteroItems;
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
                return {
                    title: zoteroItem.data.title,
                    url: zoteroItem.key, // TODO: This should be a valid url
                }
            }
        );
    } 


}

</script>

