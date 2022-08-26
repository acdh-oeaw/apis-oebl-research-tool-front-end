<template>
    <div class='TextSegment-container'>
        <component :is="annotatedTextSequenceStore.tag">
            <annotated-text-sequence-form-element 
                v-for="(textSequence, key) in annotatedTextSequenceStore.textSequences" 
                :key="key"
                :annotatedTextSequence="textSequence"
                :canEdit="canEdit"
                @[annotatedTextSequenceSelectEventType]="$emit(annotatedTextSequenceSelectEventType, $event);"
            >
            </annotated-text-sequence-form-element>
        </component>
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

}

</script>