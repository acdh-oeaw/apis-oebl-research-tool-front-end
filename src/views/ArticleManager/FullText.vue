<template>
    <v-container class='FullText-container'>
        <v-row>
            <v-col>
                <v-sheet elevation="2">
                    <text-segment 
                        v-for="(textSegment, key) in documentTextStore.segments" 
                        :key="key"
                        :annotatedTextSequenceStore="textSegment"
                        :canEdit="canEdit"
                        @[annotatedTextSequenceSelectEventType]="$emit(annotatedTextSequenceSelectEventType, $event);"
                    >
                    </text-segment>
                </v-sheet>
            </v-col>
        </v-row>
        <v-row><v-col><v-btn icon @click="addTextSegment"><v-icon>mdi-plus</v-icon></v-btn></v-col></v-row>
    </v-container>
</template>

<script lang='ts'>
import { AnnotatedTextSequenceSelectEventType, DocumentTextStore } from '@/store/textEditor/texts';
import { Component, Vue, Prop } from 'vue-property-decorator';
import TextSegment from './TextSegment.vue';


@Component({
    components: {
        TextSegment,
    }
})
export default class FullText extends Vue {

    @Prop({required: true}) documentTextStore!: DocumentTextStore;
    @Prop({required: true}) canEdit!: boolean;

    /**
     * To pass events to parent in template
     */
    annotatedTextSequenceSelectEventType = AnnotatedTextSequenceSelectEventType;
    
    addTextSegment() {
        this.documentTextStore.addEmptyTextSegment();
    }

}

</script>