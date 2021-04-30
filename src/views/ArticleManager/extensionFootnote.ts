import {
  Command,
  Mark,
  markInputRule,
  markPasteRule,
  mergeAttributes,
} from '@tiptap/core'

import { v4 as uuid } from 'uuid'

export interface FootnoteOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands {
    footnote: {
      /**
       * Set a mark
       */
      setFootnote: (attributes?: { id: string }) => Command,
      /**
       * Toggle a highlight mark
       */
      toggleFootnote: (attributes?: { id: string }) => Command,
      /**
       * Unset a highlight mark
       */
      unsetFootnote: () => Command,
    }
  }
}

export const inputRegex = /(?:^|\s)((?:==)((?:[^~]+))(?:==))$/gm
export const pasteRegex = /(?:^|\s)((?:==)((?:[^~]+))(?:==))/gm

export const Footnote = Mark.create<FootnoteOptions>({
  name: 'footnote',

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
        tag: 'footnote',
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['footnote', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setFootnote: (attributes) => ({ commands }) => {
        return commands.setMark('footnote', { id: uuid() })
      },
      toggleFootnote: (attributes) => ({ commands }) => {
        return commands.toggleMark('footnote', { id: attributes ? attributes.id : uuid() })
      },
      unsetFootnote: () => ({ commands }) => {
        return commands.unsetMark('footnote')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-f': () => this.editor.commands.toggleFootnote(),
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
