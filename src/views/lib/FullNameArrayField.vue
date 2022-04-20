<template>
    <div class="full-name-array-wrapper">
        <v-card
            class="transparent"
            elevation="0"
        >
            <h4 class="py-2 ">{{lemmaRowTranslations.alternativeNames.de}}</h4>
            <v-card-actions :class="{'edit-full-names-area': true, 'justify-center': selectedToEdit === null}">    
                <div
                    v-if="selectedToEdit === null" 
                    class="add-new-full-name-btn"
                    >
                    <v-btn
                        @click.stop="createEmptyItem()"
                        class="rounded-lg" icon
                        >
                        Weiteren Namen hinzufügen
                        <v-icon class="pl-6">
                            mdi-plus-circle-outline
                        </v-icon>
                    </v-btn>
                </div>
                <div
                    v-else
                    class="edit-full-name-input"
                    >
                    <full-name-field
                        :fullName="selectedToEdit"
                        :disabled="false"
                    ></full-name-field>
                    <v-btn-toggle 
                        class="transparent mt-1 ml-1 justify-center"
                        borderless
                        >
                        <v-btn
                            text
                            class="rounded-lg"
                            @click="saveSelectedItem()"
                            >Speichern</v-btn>
                        <v-btn 
                            @click="deleteSelectedItem()"
                            text
                            class="rounded-lg ml-3"
                            >{{ disregardText }}</v-btn>
                    </v-btn-toggle>
                </div>
            </v-card-actions>
            <v-card-text class="full-name-array py-0">
                <v-container class="py-0 px-0">
                    <div 
                        v-for="(fullName, index) in localFullNames"
                        :key=index
                        class="full-name-array-item"
                    >
                        <v-row>
                            <v-col
                                cols="11"
                                >
                                <full-name-field
                                    :fullName="fullName"
                                    :disabled="true"
                                ></full-name-field>
                            </v-col>
                            <v-col
                                cols="1"
                            >
                                <v-container fill-height class="px-0 justify">
                                    <v-btn
                                        @click.stop="editItem(index)"
                                        class="rounded-lg" icon small
                                        :disabled="isLocked"
                                    >
                                        <v-icon >
                                            mdi-pencil-circle-outline
                                        </v-icon>
                                    </v-btn>
                                </v-container>
                            </v-col>
                        </v-row>
                    </div>
                </v-container>
            </v-card-text>

        </v-card>
        <v-divider class="pb-6"></v-divider>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { FullName as FullNameType } from '@/types/lemma';
import FullNameField from '@/views/lib/FullNameField.vue'
import { lemmaRowTranslations } from '../../util/labels';

@Component({
    components: {
        FullNameField
    }
})
export default class FullNameArrayField extends Vue {

    @Prop({ default: () => [] }) fullNames!: FullNameType[];
    lemmaRowTranslations = lemmaRowTranslations;


    // A new or existing full name, selected to edit. 
    selectedToEdit: FullNameType|null = null;
    // When editing, do not sync
    get isLocked(): boolean {
        return this.selectedToEdit !== null;
    }
    get disregardText(): string {
        if (this.selectedToEdit === null) {
            throw new ErrorEvent('Nothing to disregard: No Item selected');
        }
        if (this.selectedToEdit?.firstName || this.selectedToEdit?.lastName ) {
            return 'Löschen';
        }
        return 'Abbrechen';
    }
    // Local copy of the props
    localFullNames: FullNameType[] = [];
    /**
     * Fill and change on parent update, when not locked
     * 
     * Do so on at start up, and also deep / when only a part of the name is changed
     */
    @Watch('fullNames', {immediate: true, deep: true})
    updateLocalNames() {
        if (this.isLocked) {
            return;
        }
        this.localFullNames = this.fullNames;
    }
    // Whenever edit state is over, pass data to parent
    @Watch('selectedToEdit', {immediate: false, deep: false})
    emitFullNames() {
        if (this.isLocked) {
            return;
        }
        this.$emit('submit', this.localFullNames);
    }


    createEmptyItem() {
        this.selectedToEdit = {};
    }

    deleteSelectedItem() {
        this.selectedToEdit = null;
    }

    saveSelectedItem() {
        if (this.selectedToEdit === null) {
            throw new Error('Can not save selected FullName, it is null.');
        }
        this.localFullNames.unshift(this.selectedToEdit);
        this.selectedToEdit = null;
    }

    editItem(edit_index: number) {
        this.selectedToEdit = this.localFullNames[edit_index];
        this.localFullNames = this.localFullNames.filter((_, array_index) => array_index !== edit_index);
    }

}

</script>

<style lang="css" scoped>

.full-name-array {
    padding-left: 0;
}

.edit-full-name-input {
    width: 100%;
}

</style>