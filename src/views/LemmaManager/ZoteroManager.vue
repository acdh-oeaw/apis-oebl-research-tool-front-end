<template>
    <v-expansion-panel class="transparent">
        <v-expansion-panel-header>{{ title }} ({{ zoteroItems.length }})</v-expansion-panel-header>
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

import {Vue, Component, Prop} from 'vue-property-decorator';


interface ZoteroView {
    title: string,
    url: string,
}

import { ZoteroLemmaServerConnector, ZoteroItem, ZoteroLemmaManagmentController  } from '@/service/zotero';

/**
 * Manage Zotero Items from and about a lemma (https://gitlab.com/acdh-oeaw/oebl/oebl-research-tool-front-end/-/issues/17):
 * 
 * - List items
 * - … more to come
 */
@Component
export default class ZoteroManager extends Vue {

    @Prop() ZoteroLemmaServerConnector!: ZoteroLemmaServerConnector;
    @Prop({ default: 'Zotero Literatur' }) title!: string;

    zoteroItems: Array<ZoteroItem> = [];
    zoteroLemmaManagmentController: ZoteroLemmaManagmentController = new ZoteroLemmaManagmentController(this.ZoteroLemmaServerConnector);

    created() {
        this.zoteroLemmaManagmentController.load().then(
                (zoteroItems: ZoteroItem[]) => this.zoteroItems = zoteroItems
            );
        ;
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

