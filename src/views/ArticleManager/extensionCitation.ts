import {
  Command,
  mergeAttributes
} from '@tiptap/core'

import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale.css'
import 'tippy.js/themes/light.css'
import CitationComponent from './Citation.vue'
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
        parseHTML: el => ({ id: el.getAttribute('data-id') }),
        renderHTML: attributes => ({ 'data-id': attributes.id })
      },
      zoteroKey: {
        default: null,
        parseHTML: el => ({ zoteroKey: el.getAttribute('data-zotero-key') }),
        renderHTML: attrs => ({ 'data-zotero-key': attrs.zoteroKey })
      },
      quotedRange: {
        default: null,
        parseHTML: el => ({ quotedRange: el.getAttribute('data-quoted-range') }),
        renderHTML: attrs => ({ 'data-quoted-range': attrs.quotedRange })
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: this.options.tagName
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [this.options.tagName, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    console.warn('This whole module is not working. TODO');
    return {
      setCitation: (attributes) => ({ commands }) => {
        return commands.setMark(this.name, { 
          id: null, // Removed for refactorization. Was `store.article.createCitation()` TODO: rm comment
          zoteroKey: null })
      },
      toggleCitation: (attributes) => ({ commands }) => {
        const command = commands.toggleMark(this.name, { 
          id: null, // Removed for refactorization. Was `store.article.createCitation()` TODO: rm comment
          zoteroKey: null })
        return command
      },
      unsetCitation: () => ({ commands }) => {
        return commands.unsetMark('citation')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-j': () => this.editor.commands.toggleCitation(),
    }
  }
})
