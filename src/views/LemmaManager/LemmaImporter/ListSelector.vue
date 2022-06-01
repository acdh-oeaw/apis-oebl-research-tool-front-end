<template>
    <div class="import-list-selector-container">TODO: Liste auswählen <v-btn @click="$emit('submit')">Weiter</v-btn></div>    
</template>

<script lang="ts">

import { NewLemmaRow } from "@/types/lemma";
import { SelectedList } from "@/util/lemmaimport/options";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";


@Component
export default class ListSelector extends Vue {

    @Prop({required: true}) preloadedOptions!: SelectedList;
    @Prop({required: true}) newLemmasRows!: NewLemmaRow[];

    selectedList: SelectedList = undefined;

    created() {
        this.selectedList = this.preloadedOptions;
    }

    get updatedNewLemmaRows(): NewLemmaRow[] {
        return this.newLemmasRows.map(
            newLemmaRow => Object.assign(newLemmaRow, {list: this.selectedList})
        );
    }

    @Watch('selectedList', {immediate: true, deep: false})
    @Watch('newLemmasRows', {immediate: true, deep: false})
    emit() {
        this.$emit('data', this.newLemmasRows);
        this.$emit('options', this.selectedList);
    }
}


</script>
