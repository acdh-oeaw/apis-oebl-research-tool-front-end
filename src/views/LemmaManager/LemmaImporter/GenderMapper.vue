<template>
    <div class="gender-mapper-container">
        <v-container>
            <div
                v-if="!chosenGendersAreUnique" 
                class="not-unique-gender-warning"
            >
            <v-row>
                <v-col>
                    <v-alert
                        type="warning"
                    >Es kann jedes Geschlecht nur einmal ausgefüllt werden.
                    </v-alert>
                </v-col>
            </v-row>
            </div>
            <div 
                v-for="entry, key in genderEntries"
                :key="`${key}-${entry[0]}`"
            >
                <v-row>
                    <v-col>
                        <v-combobox
                            :label="entry[1]"
                            v-model="localOptions[entry[1]]"
                            small-chips
                            deletable-chips
                            :items="availableGenders"
                            multiple
                        />
                    </v-col>
                </v-row>
            </div>

        </v-container>
    </div>
</template>
<script lang="ts">
import { GenderAe0Enum } from '@/api';
import { LemmaGender, LemmaPrototypeRequiredFieldsType } from '@/util/lemmaimport/datacontainers';
import { mapGender } from '@/util/lemmaimport/dataconversion';
import { defautLemmaFormatterOptions, GenderMappingOption } from '@/util/lemmaimport/options';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class GenderMapper extends Vue {

    @Prop({required: true}) preloadedOptions!: GenderMappingOption;
    @Prop({default: Array}) lemmaPrototypes!: LemmaPrototypeRequiredFieldsType[];
    
    localOptions: GenderMappingOption = defautLemmaFormatterOptions.genderMapping;

    genderEntries = Object.entries(GenderAe0Enum);

    created() {
        this.localOptions = this.preloadedOptions;
    }

    get genders(): Array<LemmaGender> {
        return this.lemmaPrototypes.map(
            lemma => {
                return {
                    gender: mapGender(lemma.gender, this.localOptions),
                };
            }
        );
    }

    @Watch('localOptions', {deep: true, immediate: true})
    @Watch('lemmaPrototypes', {deep: true, immediate: true})
    submit() {
        if (!this.chosenGendersAreUnique) {
            return;
        }
        this.$emit('options', this.localOptions);
        this.$emit('data', this.genders);
    }

    get gendersInSource(): Set<string> {
        return new Set(
            this.lemmaPrototypes.map(
                lemma => lemma.gender
            ).filter(
                (value: string | undefined | null): value is string => typeof value === 'string'
            )
        );
    }

    get allChosenGenders(): string[] {
        return Object.values(this.localOptions).flat();
    }


    get availableGenders(): string[] {
        return Array.from(this.gendersInSource).filter(gender => !this.allChosenGenders.includes(gender))
    }

    get chosenGendersAreUnique(): boolean {
        const genders = new Set();
        for (const gender of this.allChosenGenders) {
            if (gender === '') {
                continue;
            }
            if (genders.has(gender)) {
                return false;
            }
            genders.add(gender);
        }
        return true;
    }

}

</script>