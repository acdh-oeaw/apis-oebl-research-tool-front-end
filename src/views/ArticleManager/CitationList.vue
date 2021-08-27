<template>
  <div>
    References:
    <div class="text-body-1 mt-1 mb-5">
      <citation-display
        v-for="cit in currentCitations"
        :key="getAttrsFromNode(cit).id"
        :zotero-key="getAttrsFromNode(cit).zoteroKey"
        :quoted-range="getAttrsFromNode(cit).quotedRange"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Editor, NodeWithPos, Mark } from '@tiptap/vue-2'
import { CitationAttributes } from '@/store/article'
import { findChildrenByMark } from 'prosemirror-utils'
import { Node } from 'prosemirror-model'
import { Transaction } from 'prosemirror-state'
import CitationDisplay from './CitationDisplay.vue'

interface CitationMark extends Mark {
  attrs: CitationAttributes
}

interface CitationNode extends NodeWithPos {
  node: Node<any> & {
    marks: (CitationMark)[]
  }
}

@Component({
  components: {
    CitationDisplay
  }
})
export default class CitationList extends Vue {

  @Prop({ required: true }) editor!: Editor
  currentCitations: CitationNode[] = []

  mounted() {
    this.editor.on('transaction', this.onTransaction)
    this.currentCitations = this.findCitationsInDoc()
  }

  beforeDestroy() {
    this.editor.off('transaction', this.onTransaction)
  }

  getAttrsFromNode(n: CitationNode): CitationAttributes {
    return n.node.marks[0].attrs
  }

  findCitationsInDoc(): CitationNode[] {
    return findChildrenByMark(this.editor.state.doc, this.editor.schema.marks.citation, true) as CitationNode[]
  }

  onTransaction({ transaction }: { transaction: Transaction }) {
    if (transaction.docChanged) {
      const currentCitations = this.findCitationsInDoc()
      if (JSON.stringify(currentCitations) !== JSON.stringify(this.currentCitations)) {
        this.currentCitations = this.findCitationsInDoc()
      }
    }
  }

}
</script>
<style lang="stylus" scoped>
</style>
