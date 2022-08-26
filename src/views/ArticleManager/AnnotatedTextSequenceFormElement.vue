<template>
    <span class='AnnotatedTextSequence-container'>
        <v-textarea
            @dblclick="dblclick"
            @select="select"
            v-model="annotatedTextSequence.plainText"
        />        
    </span>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator';
import { AnnotatedTextSequence, } from '@/store/textEditor/texts';
import { ClickOnCommentEventType } from '@/store/textEditor/comments';

@Component
export default class AnnotatedTextSequenceFormElement extends Vue {

    @Prop({required: true}) annotatedTextSequence!: AnnotatedTextSequence;
    @Prop({required: true }) canEdit!: boolean;


    dblclick(): void {
        if (this.annotatedTextSequence.commentIds.length > 0) {
            this.$emit(ClickOnCommentEventType, this.annotatedTextSequence);
        }
    }
     
    select(event: Event): void {
        console.warn({TODO: event});
    }

}

</script>