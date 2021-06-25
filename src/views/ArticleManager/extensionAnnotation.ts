import {
  Command,
  mergeAttributes,
} from '@tiptap/core'
import { v4 as uuid } from 'uuid'

import AnnotationComponent from './Annotation.vue'
import popupMark from './popupPlugin'

export interface AnnotationOptions {
  HTMLAttributes: Record<string, any>,
}

export interface AnnotationAttributes {
  id: string,
  entityId: string|null,
  relationTypeId: string|null,
  relationStartTime: string|null,
  relationEndTime: string|null,
  isConfirmed: 'true'|'false'
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
      unsetAnnotation: () => Command
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
      },
      isConfirmed: {
        default: 'true',
        parseHTML(el) {
          return {
            isConfirmed: el.getAttribute('data-is-confirmed')
          }
        },
        renderHTML(attrs) {
          return {
            'data-is-confirmed': attrs.isConfirmed
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
    return ['mark', mergeAttributes(this.options.HTMLAttributes, props.HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setAnnotation: (attributes) => ({ commands }) => {
        return commands.setMark('annotation', { id: uuid() })
      },
      toggleAnnotation: (attributes) => ({ commands }) => {
        if (this.editor.isActive(this.name)) {
          return commands.unsetMark('annotation')
        } else {
          const command = commands.toggleMark('annotation', { id: uuid() })
          return command
        }
      },
      unsetAnnotation: () => ({ commands }) => {
        return commands.unsetMark('annotation')
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-e': () => this.editor.commands.toggleAnnotation(),
    }
  },

})
