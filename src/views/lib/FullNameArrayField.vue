<template>
    <div class="full-name-array-wrapper">
        <v-card
            class="transparent"
            elevation="0"
        >
            <h5 class="py-2 ">Alternative Namen</h5>
            <v-card-text class="full-name-array py-0">
                <v-container class="py-0 px-0">
                    <div 
                        v-for="(fullName, index) in localFullNames"
                        :key=index
                        @input="emitInput"
                        class="full-name-array-item"
                    >
                        <v-row>
                            <v-col
                                cols="11"
                                >
                                <full-name-field
                                    :fullName="fullName"
                                    @input="updateItem($event, index)"
                                ></full-name-field>
                            </v-col>
                            <v-col
                                cols="1"
                            >
                                <v-container fill-height class="px-0 justify">
                                    <v-btn
                                        @click.stop="removeItem(index)"
                                        class="rounded-lg" icon small
                                    >
                                        <v-icon >
                                            mdi-minus-circle-outline
                                        </v-icon>
                                    </v-btn>
                                </v-container>
                            </v-col>
                        </v-row>
                    </div>
                </v-container>
            </v-card-text>
            <v-card-actions class="justify-center pt-0">    
                <div class="add-new-full-name-btn">
                    <v-btn
                        @click.stop="addEmptyItem()"
                        class="rounded-lg" icon
                        >
                        Hinzufügen
                        <v-icon class="pl-6">
                            mdi-plus-circle-outline
                        </v-icon>
                    </v-btn>
                </div>
            </v-card-actions>
        </v-card>
        <v-divider class="pb-6"></v-divider>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { FullName as FullNameType } from '@/types/lemma';
import FullNameField from '@/views/lib/FullNameField.vue'

@Component({
    components: {
        FullNameField
    }
})
export default class FullNameArrayField extends Vue {

    @Prop({ default: () => [] }) fullNames!: FullNameType[];

    localFullNames: FullNameType[] = this.fullNames;

    emitInput() {
        this.$emit('input', this.localFullNames);
    }

    removeItem(index: number) {
        this.localFullNames.splice(index, 1);
    }

    updateItem(eventData: FullNameType, index: number) {
        console.debug({eventData: eventData})
        const fullNames = this.localFullNames;
        fullNames[index] = eventData;
        this.localFullNames = fullNames;
    }

    addEmptyItem() {
        this.localFullNames.push({firstName: undefined, lastName: undefined})
    }
}

</script>

<style lang="css" scoped>

.full-name-array {
    padding-left: 0;
}

</style>