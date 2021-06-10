import {
  Command,
  Mark,
  mergeAttributes,
} from '@tiptap/core'

import { v4 as uuid } from 'uuid'
import { VueRenderer } from '@tiptap/vue-2'
import tippy, { Instance as TippyInstance, hideAll } from 'tippy.js'

import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale.css'
import 'tippy.js/themes/light.css'
import 'tippy.js/dist/backdrop.css'

import { findChildrenByMark } from 'prosemirror-utils'
import CommentThread from './CommentThread.vue'
import popupMark from './popupPlugin'

import store from '@/store'

export interface CommentOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands {
    comment: {
      /**
       * Set a mark
       */
      setComment: (attributes?: { id: string }) => Command,
      /**
       * Toggle a mark
       */
      toggleComment: (attributes?: { id: string }) => Command,
      /**
       * Unset a mark
       */
      unsetComment: () => Command,
      showCommentPopUp: (attributes: { id: string, shouldFocus: boolean }) => Command
    }
  }
}

export const Comment = popupMark.extend({
  name: 'comment',

  defaultOptions: {
    HTMLAttributes: {},
    component: CommentThread,
    tagName: 'comment'
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => {
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
        tag: 'comment',
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['comment', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setComment: (attributes) => ({ commands }) => {
        console.log('new comment')
        return commands.setMark('comment', { id: uuid() })
      },
      toggleComment: (attributes) => ({ commands }) => {
        if (this.editor.isActive(this.name)) {
          return commands.unsetMark('comment')
        } else {
          const id = store.article.createThread()
          const command = commands.toggleMark('comment', { id })
          requestAnimationFrame(() => {
            this.editor.commands.showCommentPopUp({ id, shouldFocus: true })
          })
          return command
        }
      },
      unsetComment: () => ({ commands }) => {
        return commands.unsetMark('comment')
      },
      // showCommentPopUp: (attributes) => ({ commands }) => {
      //   const el = document.querySelector(`comment[data-id="${ attributes.id }"]`)
      //   if (el instanceof HTMLElement) {
      //     // it has already been created: show.
      //     if ((el as any)._tippy) {
      //       ((el as any)._tippy as TippyInstance).show()
      //     // it must be created: create and show.
      //     } else {
      //       const component = new VueRenderer(CommentThread, { parent: this.parent, propsData: { id: attributes.id } })
      //       const t = tippy(el, {
      //         content: component.element,
      //         showOnCreate: true,
      //         allowHTML: true,
      //         interactive: true,
      //         trigger: 'manual',
      //         placement: 'auto',
      //         animation: 'scale',
      //         theme: 'light',
      //         maxWidth: 350,
      //         appendTo: document.querySelector('#app') as Element,
      //         inertia: true,
      //         moveTransition: 'transform 0.2s ease-out'
      //       })
      //       if (attributes.shouldFocus) {
      //         requestAnimationFrame(() => {
      //           // eslint-disable-next-line no-unused-expressions
      //           t.popper.querySelector('textarea')?.focus()
      //         })
      //       }
      //       t.popper.addEventListener('keyup', (e) => {
      //         if (e.key === 'Escape') {
      //           e.stopPropagation()
      //           t.hide()
      //           this.editor.chain().focus().run()
      //         }
      //       })
      //     }
      //   }
      //   return true
      // }
    }
  },

  // getAllComments() {
  //   return null
  // },

  onUpdate(...a: any[]) {
    const [ { editor, transaction } ] = a
    const comments = findChildrenByMark(transaction.doc, editor.schema.marks.comment, true)
      .map((n) => {
        return {
          pos: n.pos,
          mark: n.node.marks.find((m: any) => m.type.name === 'comment')
        }
      })
      .filter(m => m.mark !== undefined)
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
  // },

  addKeyboardShortcuts() {
    return {
      'Mod-k': () => this.editor.commands.toggleComment(),
    }
  },

})
