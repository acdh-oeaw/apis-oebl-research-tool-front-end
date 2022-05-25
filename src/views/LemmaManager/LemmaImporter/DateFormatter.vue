<template>
    <div class="date-formating-container">
        <v-container>
            <v-row>
                <v-col>
                    <v-select
                        label="Datumsformat"
                        :items="supportedDateFormats"
                        v-model="localDateFormat"
                    />
                </v-col>
            </v-row>
            <v-row class="date-parse-preview">
                <v-col>
                    <v-data-table
                        :headers="previewHeaders"
                        :items="dateViews"
                    />
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
<script lang="ts">
import { factoryMethods, supportedDateFormats, SupportedDateFormatType } from '@/util/dates';
import { lemmaRowTranslations } from '@/util/labels';
import { LemmaDates, LemmaPrototypeRequiredFieldsType } from '@/util/lemmaimport/datacontainers';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

type DateComparisionView = {
    firstName: string, lastName: string, 
    dateOfBirthString: string, dateOfBirthParsed: string, 
    dateOfDeathString: string, dateOfDeathParsed: string,
};

@Component
export default class DateFormatter extends Vue {

    @Prop({default: Array}) lemmaPrototypes!: LemmaPrototypeRequiredFieldsType[];
    @Prop({required: true}) preloadedDateFormatOption!: SupportedDateFormatType;

    supportedDateFormats: SupportedDateFormatType[] = supportedDateFormats;
    localDateFormat: SupportedDateFormatType = supportedDateFormats[0];

    created() {
        this.localDateFormat = this.preloadedDateFormatOption;
    }

    get dates(): LemmaDates[] {
        const factoryMethod = factoryMethods[this.localDateFormat];
        return this.lemmaPrototypes.map(
            lemmaPrototype => {
                return {
                    dateOfBirth: factoryMethod(lemmaPrototype.dateOfBirth),
                    dateOfDeath: factoryMethod(lemmaPrototype.dateOfDeath),
                };
            }
        );
    }

    @Watch('dates', {immediate: true, deep: true})
    @Watch('options', {immediate: true, deep: true})
    submit() {
        this.$emit('options', this.localDateFormat);
        this.$emit('data', this.dates);
    }

    get dateViews(): DateComparisionView[] {

        const comparisionViews: DateComparisionView[] = [];

        let dateRow: LemmaDates;
        let lemmaPrototype: LemmaPrototypeRequiredFieldsType;

        for (let index: number = 0; index < this.lemmaPrototypes.length; index ++) {
            dateRow = this.dates[index];
            lemmaPrototype = this.lemmaPrototypes[index];

            comparisionViews.push(
                {
                    firstName: lemmaPrototype.firstName ?? '', 
                    lastName: lemmaPrototype.lastName,
                    dateOfBirthString: lemmaPrototype.dateOfBirth ?? '', 
                    dateOfBirthParsed: dateRow.dateOfBirth.isValid() ? dateRow.dateOfBirth.toString() : 'Datum unerkannt', 
                    dateOfDeathString: lemmaPrototype.dateOfDeath ?? '', 
                    dateOfDeathParsed: dateRow.dateOfDeath.isValid() ? dateRow.dateOfDeath.toString() : 'Datum unerkannt', 
                }
            );
        }


        return comparisionViews;
    }

    previewHeaders = [
        {text: lemmaRowTranslations.firstName.de, value: 'firstName'},
        {text: lemmaRowTranslations.lastName.de, value: 'lastName'},
        {text: `${lemmaRowTranslations.dateOfBirth.de} Quelle`, value: 'dateOfBirthString'},
        {text: `${lemmaRowTranslations.dateOfBirth.de} geparst`, value: 'dateOfBirthParsed'},
        {text: `${lemmaRowTranslations.dateOfDeath.de} Quelle`, value: 'dateOfDeathString'},
        {text: `${lemmaRowTranslations.dateOfDeath.de} geparst`, value: 'dateOfDeathParsed'},

    ];

}

</script>