import {
  Command,
  Mark,
  markInputRule,
  markPasteRule,
  mergeAttributes,
} from '@tiptap/core'

import { v4 as uuid } from 'uuid'
import { VueRenderer } from '@tiptap/vue-2'
import tippy, { Instance as TippyInstance, hideAll } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale.css'
import 'tippy.js/themes/light.css'
import store from '@/store'
import CommentThread from './CommentThread.vue'

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
    }
  }
}

export const inputRegex = /(?:^|\s)((?:==)((?:[^~]+))(?:==))$/gm
export const pasteRegex = /(?:^|\s)((?:==)((?:[^~]+))(?:==))/gm

export const Comment = Mark.create<CommentOptions>({
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
        console.log('new comment')
        return commands.setMark('comment', { id: uuid() })
      },
      toggleComment: (attributes) => ({ commands }) => {
        console.log('toggle', attributes, commands)
        const command = commands.toggleMark('comment', { id: attributes ? attributes.id : uuid() })
        return command
      },
      unsetComment: () => ({ commands }) => {
        return commands.unsetMark('comment')
      },
    }
  },

  onSelectionUpdate() {
    if (this.editor.isActive(this.name)) {
      const { id } = this.editor.getMarkAttributes(this.name)
      if (typeof id === 'string') {
        console.log('comment id', id)
        const el = document.querySelector(`[data-id="${ id }"]`)
        if (el instanceof HTMLElement) {
          if ((el as any)._tippy) {
            ((el as any)._tippy as TippyInstance).show()
          } else {
            const component = new VueRenderer(CommentThread, { parent: this.parent, propsData: { id } })
            tippy(el, {
              content: component.element,
              showOnCreate: true,
              allowHTML: true,
              interactive: true,
              trigger: 'manual',
              animation: 'scale',
              theme: 'light',
              maxWidth: 350,
              appendTo: document.querySelector('#app') as Element,
              inertia: true,
              moveTransition: 'transform 0.2s ease-out'
            })
          }
        }
      } else {
        hideAll()
      }
    } else {
      hideAll()
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
