import {
  Command,
  mergeAttributes
} from '@tiptap/core'

import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale.css'
import 'tippy.js/themes/light.css'
import { findChildrenByMark } from 'prosemirror-utils'
import CitationComponent from './Citation.vue'
import store from '@/store'
import popupExtension from './popupPlugin'

export interface CitationOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands {
    citation: {
      /**
       * Set a mark
       */
      setCitation: (attributes?: { id: string }) => Command,
      /**
       * Toggle a mark
       */
      toggleCitation: (attributes?: { id: string }) => Command,
      /**
       * Unset a mark
       */
      unsetCitation: () => Command,
    }
  }
}

export const Citation = popupExtension.extend({

  name: 'citation',

  defaultOptions: {
    HTMLAttributes: {},
    tagName: 'footnote',
    component: CitationComponent
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => {
          return {
            id: element.getAttribute('data-id'),
          }
        },
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          } else {
            return { 'data-id': attributes.id }
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'footnote',
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['footnote', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setCitation: (attributes) => ({ commands }) => {
        return commands.setMark('citation', { id: store.article.createCitation() })
      },
      toggleCitation: (attributes) => ({ commands }) => {
        const command = commands.toggleMark('citation', { id: store.article.createCitation() })
        return command
      },
      unsetCitation: () => ({ commands }) => {
        return commands.unsetMark('citation')
      },
    }
  },

  // getAllComments() {
  //   return null
  // },

  onUpdate() {
    const doc = this.editor.state.doc
    const commentMark = this.editor.schema.marks.comment
    const commentsWithPos = findChildrenByMark(doc, commentMark, true)
      .map((n) => {
        return {
          pos: n.pos,
          mark: n.node.marks.find((m: any) => m.type.name === 'comment')
        }
      })
      .filter(m => m.mark !== undefined)
      .reduce((m, e) => {
        if (e.mark.attrs !== undefined && typeof e.mark.attrs.id === 'string') {
          m[e.mark.attrs.id] = e.pos
        }
        return m
      }, {} as { [id: string]: number })
    store.article.updateCommentOffsets(commentsWithPos)
  },

  // onSelectionUpdate() {
  //   if (this.editor.isActive(this.name)) {
  //     const { id } = this.editor.getAttributes(this.name)
  //     if (typeof id === 'string') {
  //       this.editor.commands.showCommentPopUp({ id, shouldFocus: false })
  //     } else {
  //       hideAll()
  //     }
  //   } else {
  //     hideAll()
  //   }
  //   if (this.editor.isActive(this.name)) {
  //     const { id } = this.editor.getAttributes(this.name)
  //     if (typeof id === 'string') {
  //       const el = document.querySelector(`footnote[data-id="${ id }"]`)
  //       if (el instanceof HTMLElement) {
  //         // it has already been created: show.
  //         if ((el as any)._tippy) {
  //           ((el as any)._tippy as TippyInstance).show()
  //         // it must be created: create and show.
  //         } else {
  //           const component = new VueRenderer(CitationComponent, { parent: this.parent, propsData: { id } })
  //           tippy(el, {
  //             content: component.element,
  //             showOnCreate: true,
  //             allowHTML: true,
  //             interactive: true,
  //             trigger: 'manual',
  //             animation: 'scale',
  //             placement: 'auto',
  //             theme: 'light',
  //             maxWidth: 350,
  //             appendTo: document.querySelector('.v-application--wrap') as Element,
  //             inertia: true,
  //             moveTransition: 'transform 0.2s ease-out'
  //           })
  //         }
  //       }
  //     } else {
  //       hideAll()
  //     }
  //   } else {
  //     hideAll()
  //   }
  // },

  addKeyboardShortcuts() {
    return {
      'Mod-j': () => this.editor.commands.toggleCitation(),
    }
  }
})
