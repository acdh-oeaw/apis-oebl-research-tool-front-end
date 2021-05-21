<template>
  <node-view-wrapper class="vue-component image-wrapper">
    <figure>
      <img
        contenteditable="false"
        draggable="true"
        data-drag-handle
        :src="node.attrs.src">
      <figcaption>
        <node-view-content @input="updateAlt" class="image-description">{{ node.attrs.alt || 'Bildunterschrift' }}</node-view-content>
      </figcaption>
    </figure>
  </node-view-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NodeViewWrapper, nodeViewProps, NodeViewContent } from '@tiptap/vue-2'
import { Node } from 'prosemirror-model'
@Component({
  components: {
    NodeViewWrapper,
    NodeViewContent
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
  margin 1em 0 1em 0
  font-size 90%
  padding 0.5rem
  border 2px dashed #0D0D0D20
  border-radius 0.5rem

img
  max-height 50vh

.drag-handle {
  flex: 0 0 auto;
  position: relative;
  width: 1rem;
  height: 1rem;
  top: 0.3rem;
  margin-right: 0.5rem;
  cursor: grab;
  background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16"><path fill-opacity="0.2" d="M4 14c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM2 6C.9 6 0 6.9 0 8s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>');
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
}

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
