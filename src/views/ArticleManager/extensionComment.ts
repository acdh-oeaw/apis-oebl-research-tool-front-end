import {
  Command,
  mergeAttributes,
} from '@tiptap/core'

import { v4 as uuid } from 'uuid'

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
          const id = store.article.createCommentThread()
          const command = commands.toggleMark('comment', { id })
          return command
        }
      },
      unsetComment: () => ({ commands }) => {
        return commands.unsetMark('comment')
      },
    }
  },

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

  addKeyboardShortcuts() {
    return {
      'Mod-k': () => this.editor.commands.toggleComment(),
    }
  },

})
