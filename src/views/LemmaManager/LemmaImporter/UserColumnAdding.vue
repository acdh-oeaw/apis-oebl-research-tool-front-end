<template>
    <div class="user-columns-adding-container">
        TODO :-)

        <v-btn
            @click="submit"
        >Gemma, gemma</v-btn>
    </div>
</template>
<script lang="ts">
import { NewLemmaRow } from "@/types/lemma";
import { Data2D } from "@/util/lemmaimport/datacontainers";
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

    created() {
        this.localOptions = this.preloadedOptions;
    }

    localLemmas: NewLemmaRow[] = [];

    @Watch('localOptions', {deep: true, immediate: true})
    @Watch('localLemmas', {deep: false, immediate: true})
    emit() {
        this.$emit('data', this.localLemmas);
        this.$emit('options', this.localOptions);
    }

    submit() {
        this.$emit('submit');
    }

}

</script>    