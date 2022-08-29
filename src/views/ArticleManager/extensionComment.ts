import {
  Command,
  mergeAttributes,
} from '@tiptap/core'

import { v4 as uuid } from 'uuid'
import CommentThread from './CommentThread.vue'
import popupMark from './popupPlugin'

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
    console.warn('This whole module is not working. TODO');
    return {
      setComment: (attributes) => ({ commands }) => {
        console.log('new comment')
        return commands.setMark('comment', { id: uuid() })
      },
      toggleComment: (attributes) => ({ commands }) => {
        if (this.editor.isActive(this.name)) {
          return commands.unsetMark('comment')
        } else {
          const id = null; // Removed for refactorization. Was `const id = store.article.createCommentThread()` TODO: rm comment
          const command = commands.toggleMark('comment', { id })
          return command
        }
      },
      unsetComment: () => ({ commands }) => {
        return commands.unsetMark('comment')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-k': () => this.editor.commands.toggleComment(),
    }
  },

})
