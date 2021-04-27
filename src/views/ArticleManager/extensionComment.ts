import {
  Command,
  Mark,
  markInputRule,
  markPasteRule,
  mergeAttributes,
} from '@tiptap/core'

import { v4 as uuid } from 'uuid'

export interface HighlightOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands {
    highlight: {
      /**
       * Set a highlight mark
       */
      setComment: (attributes?: { id: string }) => Command,
      /**
       * Toggle a highlight mark
       */
      toggleComment: (attributes?: { id: string }) => Command,
      /**
       * Unset a highlight mark
       */
      unsetComment: () => Command,
    }
  }
}

export const inputRegex = /(?:^|\s)((?:==)((?:[^~]+))(?:==))$/gm
export const pasteRegex = /(?:^|\s)((?:==)((?:[^~]+))(?:==))/gm

export const Comment = Mark.create<HighlightOptions>({
  name: 'comment',

  defaultOptions: {
    HTMLAttributes: {},
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
        return commands.setMark('comment', { id: uuid() })
      },
      toggleComment: (attributes) => ({ commands }) => {
        return commands.toggleMark('comment', { id: attributes ? attributes.id : uuid() })
      },
      unsetComment: () => ({ commands }) => {
        return commands.unsetMark('comment')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-k': () => this.editor.commands.toggleComment(),
    }
  },

  addInputRules() {
    return [
      markInputRule(inputRegex, this.type),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule(inputRegex, this.type),
    ]
  }
})
