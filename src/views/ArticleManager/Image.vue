<template>
  <node-view-wrapper class="vue-component image-wrapper">
    <figure tabindex="-1">
      <img
        contenteditable="false"
        draggable="true"
        data-drag-handle
        :src="node.attrs.src">
      <figcaption>
        <div class="image-description">
          <div draggable="true" contenteditable="false" class="caption muted">Abbildung</div>
          <node-view-content />
        </div>
        <!-- <text-field contenteditable="false" label="copyright" /> -->
      </figcaption>
    </figure>
  </node-view-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NodeViewWrapper, nodeViewProps, NodeViewContent } from '@tiptap/vue-2'
import { Node } from 'prosemirror-model'
import TextField from '../lib/TextField.vue'
@Component({
  components: {
    NodeViewWrapper,
    NodeViewContent,
    TextField
  }
})
export default class ProsemirrorImage extends Vue {

  @Prop(nodeViewProps.node) node!: Node<any>
  @Prop({ required: true }) updateAttributes!: Function

  mounted() {
    console.log(this.$props)
  }

  updateAlt(ev: InputEvent) {
    console.log('update alt', ev)
    if (ev.target instanceof HTMLElement) {
      this.updateAttributes({
        alt: ev.target.textContent
      })
    }
  }
}
</script>
<style lang="stylus" scoped>
.image-wrapper
  text-align center

.image-description
  margin .5em 0 1em 0
  font-size 90%
  padding 0.25rem
  border 2px dashed #0D0D0D20
  border-radius 0.5rem

img
  max-height 40vh
  border-radius 10px

.image-description:empty:before
  content 'Bildunterschrift'
  pointer-events none
  color: #ced4da;

// .ProseMirror p.is-editor-empty:first-child::before {
//     content: attr(data-placeholder);
//     float: left;
//     color: #ced4da;
//     pointer-events: none;
//     height: 0;
//   }

</style>
