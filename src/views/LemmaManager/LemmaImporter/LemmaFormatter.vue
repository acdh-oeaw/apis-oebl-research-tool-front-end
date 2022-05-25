<template>
    <div class="lemma-formatter-container">
        <v-expansion-panels multiple>
            <v-expansion-panel class="null-managment-row">
                <v-expansion-panel-header>Null-Werte</v-expansion-panel-header>
                <v-expansion-panel-content eager>
                    <null-manager
                        :lemmaPrototypes="lemmaPrototypes"
                        :preloadedNullValues="localOptions.nullValues"
                        @options="localOptions.nullValues = $event"
                        @data="lemmasPrototypesWithNullsAndRequiredFields = $event"
                    />
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>Datumsformattierung</v-expansion-panel-header>
                <v-expansion-panel-content eager>
                    <date-formatter 
                        :lemmaPrototypes="lemmasPrototypesWithNullsAndRequiredFields"
                        :preloadedDateFormatOption="localOptions.dateFormat"
                        @data="dates = $event"
                        @options="localOptions.dateFormat = $event"
                    />
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>Gender</v-expansion-panel-header>
                <v-expansion-panel-content eager>
                    <gender-mapper 
                        :lemmaPrototypes="lemmasPrototypesWithNullsAndRequiredFields"
                        :preloadedOptions="localOptions.genderMapping"
                        @data="genders = $event"
                        @options="localOptions.genderMapping = $event"
                    />
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>

<script lang="ts">

import { LemmaRow } from "@/types/lemma";
import { LemmaPrototypeStringType, LemmaPrototypeRequiredFieldsType, LemmaDates, LemmaGender } from "@/util/lemmaimport/datacontainers";
import { LemmaFormatterOptions, defautLemmaFormatterOptions } from "@/util/lemmaimport/options";
import { Component, Prop, Vue } from "vue-property-decorator";
import DateFormatter from "./DateFormatter.vue";
import GenderMapper from "./GenderMapper.vue";
import NullManager from "./NullManager.vue";


/**
 * Takes LemmaPrototypes And Converts Them To LemmaRows
 */
@Component({
    components: {
        NullManager,  
        DateFormatter,
        GenderMapper,
    },
})
export default class LemmaFormatter extends Vue {

    @Prop({required: true, default: Array}) lemmaPrototypes!: LemmaPrototypeStringType[];
    @Prop({required: true }) preloadedOptions!: LemmaFormatterOptions;

    localOptions: LemmaFormatterOptions = defautLemmaFormatterOptions;

    created() {
        this.localOptions = this.preloadedOptions;
    }

    lemmasPrototypesWithNullsAndRequiredFields: LemmaPrototypeRequiredFieldsType[] = [];

    dates: LemmaDates[] = [];
    genders: LemmaGender[] = [];

    newLemmas: LemmaRow[] = [];

    submit() {
        this.$emit('data', this.newLemmas);
        this.$emit('options', this.localOptions);
        this.$emit('submit');
    }



}

</script>