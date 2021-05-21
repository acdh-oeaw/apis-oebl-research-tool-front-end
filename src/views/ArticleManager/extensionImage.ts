// import { Plugin } from 'prosemirror-state'

// export function imageDropHandler(schema, url) {
//   let plugin = new Plugin({
//     props: {
//       handleDOMEvents: {
//         drop: (view, event) => {
//           let files = event.dataTransfer.files
//           let sel = view.state.tr.curSelection
//           if (files.length == 0) {
//             return
//           }

//           if (event.preventDefault !== undefined) {
//             event.preventDefault()
//           } else {
//             window.event.returnValue = false
//           }

//           ([...files[0]]).forEach((file, i, filelist) => {
//             console.log('drop', file)
//             if (
//               file.type !== 'image/svg+xml' &&
//               file.type !== 'image/png' &&
//               file.type !== 'image/jpeg' &&
//               file.type !== 'image/gif'
//             ) {
//               console.log('not image', file.type)
//               return
//             }
//             let formData = new FormData()
//             formData.append('file', file)
//             var x = new XMLHttpRequest()
//             x.open('POST', url)
//             x.onload = function (ret) {
//               if (x.readyState == 4 && x.status == 200) {
//                 let pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
//                 view.dispatch(
//                   view.state.tr.replaceWith(pos.pos, pos.pos,
//                     schema.nodes.image.create({
//                       src: x.responseText
//                     }
//                     )
//                   ).scrollIntoView())
//               }
//             }
//             x.send(formData)
//           })
//         }
//       }
//     }
//   })
//   return plugin
// }

import { Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { VueNodeViewRenderer } from '@tiptap/vue-2'
import ImageComponent from './Image.vue'
import {
  Command,
  Node,
  nodeInputRule,
  mergeAttributes
} from '@tiptap/core'

export interface ImageOptions {
  inline: boolean,
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands {
    image: {
      setImage: (options: { src: string, alt?: string, title?: string }) => Command,
    }
  }
}

export const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/

function onDrop(this: Plugin<any, any>, view: EditorView, event: DragEvent, schema: any) {
  if (
    event.dataTransfer === null ||
    event.dataTransfer.files.length === 0
  ) {
    return false
  } else {
    const file = event.dataTransfer.files[0]
    if (!file.type.startsWith('image/')) {
      return false
    } else {
      event.preventDefault()
      const url = URL.createObjectURL(file)
      const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
      if (pos !== null && pos !== undefined) {
        view.dispatch(
          view.state.tr.replaceWith(pos.pos, pos.pos,
            schema.nodes.image.create({
              src: url
            })
          ).scrollIntoView())
        return true
      } else {
        return false
      }
    }
  }
}

export const Image = Node.create<ImageOptions>({

  name: 'image',

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
    console.log({HTMLAttributes})
    return [
      'img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
    ]
  },

  addNodeView() {
    return VueNodeViewRenderer(ImageComponent)
  },

  addCommands() {
    return {
      setImage: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },

  addInputRules() {
    return [
      nodeInputRule(inputRegex, this.type, match => {
        const [, alt, src, title] = match
        return { src, alt, title }
      }),
    ]
  },
})
