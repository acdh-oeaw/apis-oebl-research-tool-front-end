import {
  Command,
  mergeAttributes,
} from '@tiptap/core'

import AnnotationComponent from './Annotation.vue'
import popupMark from './popupPlugin'

import store from '@/store'

export interface AnnotationOptions {
  HTMLAttributes: Record<string, any>,
}

interface AnnotationAttributes {
  id: string,
  entityId: string|null,
  relationTypeId: string|null
}

declare module '@tiptap/core' {
  interface Commands {
    annotation: {
      /**
       * Set a mark
       */
      setAnnotation: (attributes?: { id: string }) => Command,
      /**
       * Toggle a mark
       */
      toggleAnnotation: (attributes?: { id: string }) => Command,
      /**
       * Unset a mark
       */
      unsetAnnotation: () => Command,
      updateAnnotation: (attributes: AnnotationAttributes) => Command
    }
  }
}

export const Annotation = popupMark.extend({

  name: 'annotation',

  defaultOptions: {
    HTMLAttributes: {},
    component: AnnotationComponent,
    tagName: 'mark'
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML(el) {
          return {
            id: el.getAttribute('data-id'),
          }
        },
        renderHTML(attrs) {
          return { 'data-id': attrs.id }
        },
      },
      entityId: {
        default: null,
        parseHTML(el) {
          return {
            entityId: el.getAttribute('data-entity-id')
          }
        },
        renderHTML(attrs) {
          return { 'data-entity-id': attrs.entityId }
        }
      },
      relationTypeId: {
        default: null,
        parseHTML(el) {
          return {
            relationTypeId: el.getAttribute('data-relation-type-id')
          }
        },
        renderHTML(attrs) {
          return {
            'data-relation-type-id': attrs.relationTypeId
          }
        }
      },
      relationStartTime: {
        default: null,
        parseHTML(el) {
          return {
            relationStartTime: el.getAttribute('data-relation-start-time')
          }
        },
        renderHTML(attrs) {
          return {
            'data-relation-start-time': attrs.relationStartTime
          }
        }
      },
      relationEndTime: {
        default: null,
        parseHTML(el) {
          return {
            relationEndTime: el.getAttribute('data-relation-end-time')
          }
        },
        renderHTML(attrs) {
          return {
            'data-relation-end-time': attrs.relationEndTime
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'mark',
      }
    ]
  },

  renderHTML(props) {
    console.log({props})
    return ['mark', mergeAttributes(this.options.HTMLAttributes, props.HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setAnnotation: (attributes) => ({ commands }) => {
        return commands.setMark('annotation', { id: store.article.createAnnotation() })
      },
      toggleAnnotation: (attributes) => ({ commands }) => {
        if (this.editor.isActive(this.name)) {
          return commands.unsetMark('annotation')
        } else {
          const id = store.article.createAnnotation()
          const command = commands.toggleMark('annotation', { id })
          return command
        }
      },
      unsetAnnotation: () => ({ commands }) => {
        return commands.unsetMark('annotation')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-e': () => this.editor.commands.toggleAnnotation(),
    }
  },

})
