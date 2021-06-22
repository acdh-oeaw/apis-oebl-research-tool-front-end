import { Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { VueNodeViewRenderer } from '@tiptap/vue-2'
import AudioComponent from './AudioNode.vue'

import {
  Command,
  Node,
  mergeAttributes
} from '@tiptap/core'

export interface AudioOptions {
  inline: boolean,
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands {
    audio: {
      setAudio: (options: { src: string, alt?: string, title?: string }) => Command,
    }
  }
}

function onDrop(this: Plugin<any, any>, view: EditorView, event: DragEvent, schema: any) {
  if (
    event.dataTransfer === null ||
    event.dataTransfer.files.length === 0
  ) {
    return false
  } else {
    const file = event.dataTransfer.files[0]
    if (!file.type.startsWith('audio/')) {
      return false
    } else {
      event.preventDefault()
      const url = URL.createObjectURL(file)
      const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
      if (pos !== null && pos !== undefined) {
        view.dispatch(
          view.state.tr.replaceWith(pos.pos, pos.pos,
            schema.nodes.audio.create({
              src: url,
              alt: 'Tonunterschrift'
            })
          ).scrollIntoView())
        return true
      } else {
        return false
      }
    }
  }
}

export const Audio = Node.create<AudioOptions>({

  name: 'audio',

  addProseMirrorPlugins() {
    const schema = this.editor.schema
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop(view, event) {
              return onDrop.bind(this)(view, event, schema)
            }
          }
        }
      })
    ]
  },

  content: 'inline*',

  defaultOptions: {
    inline: false,
    HTMLAttributes: {},
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'audio', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
    ]
  },

  addNodeView() {
    return VueNodeViewRenderer(AudioComponent)
  },

  addCommands() {
    return {
      setAudio: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  }

})
