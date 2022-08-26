<template>
    <div class='TextSegment-container' @click="addEmptyTextSequence">
        <v-container>
            <v-row dense>
                <v-col cols="11">
                    <v-sheet elevation="9">
                        <component :is="annotatedTextSequenceStore.tag" >
                        <annotated-text-sequence-form-element 
                            v-for="(textSequence, key) in annotatedTextSequenceStore.textSequences" 
                            :key="key"
                            :annotatedTextSequence="textSequence"
                            :canEdit="canEdit"
                            @[annotatedTextSequenceSelectEventType]="$emit(annotatedTextSequenceSelectEventType, $event);"
                        >
                        </annotated-text-sequence-form-element>
                    </component>
                    </v-sheet>
                </v-col>
                <v-col cols="0.5">
                    <v-select :items="[
                        {text: 'Absatz', value: 'p'},
                        {text: 'Überschrift 1', value: 'h1'},
                        {text: 'Überschrift 2', value: 'h2'},
                    ]"
                    v-model="annotatedTextSequenceStore.tag"

                    />
                </v-col>
            </v-row>
        </v-container>
        <v-divider/>
    </div>
</template>

<script lang='ts'>
import { AnnotatedTextSequenceSelectEventType, AnnotatedTextSequenceStore, } from '@/store/textEditor/texts';
import { Component, Prop, Vue,  } from 'vue-property-decorator';
import AnnotatedTextSequenceFormElement from './AnnotatedTextSequenceFormElement.vue';


@Component({
    components: {
        AnnotatedTextSequenceFormElement,
    }
})
export default class TextSegment extends Vue {

    @Prop({required: true}) annotatedTextSequenceStore!: AnnotatedTextSequenceStore;
    @Prop({required: true}) canEdit!: boolean;

    /**
     * To pass events to parent in template
     */
    annotatedTextSequenceSelectEventType = AnnotatedTextSequenceSelectEventType;

    addEmptyTextSequence() {
        // Make sure, there is something to edit
        if (this.annotatedTextSequenceStore.textSequences.length === 0) {
            this.annotatedTextSequenceStore.addEmptyTextSequence();
        }
    }

}

</script>
