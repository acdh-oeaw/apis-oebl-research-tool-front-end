<template>
    <div class="lemma-formatter-container">

    </div>
</template>

<script lang="ts">

import { LemmaRow } from "@/types/lemma";
import { LemmaPrototypeStringType } from "@/util/lemmaimport/datacontainers";
import { LemmaFormatterOptions, defautLemmaFormatterOptions } from "@/util/lemmaimport/options";
import { Component, Prop, Vue } from "vue-property-decorator";


/**
 * Takes LemmaPrototypes And Converts Them To LemmaRows
 */
@Component
export default class LemmaFormatter extends Vue {

    @Prop({required: true, default: Array}) lemmaPrototypes!: LemmaPrototypeStringType[];
    @Prop({required: true }) preloadedOptions!: LemmaFormatterOptions;

    localOptions: LemmaFormatterOptions = defautLemmaFormatterOptions;

    created() {
        this.localOptions = this.preloadedOptions;
    }

    newLemmas: LemmaRow[] = [];

    submit() {
        this.$emit('data', this.newLemmas);
        this.$emit('options', this.localOptions);
        this.$emit('submit');
    }



}

</script>