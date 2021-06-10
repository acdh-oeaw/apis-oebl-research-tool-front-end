import { Editor, getMarkAttributes } from '@tiptap/core'
import { Mark, VueRenderer } from '@tiptap/vue-2'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import Vue, { VueConstructor } from 'vue'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale.css'
import 'tippy.js/themes/light.css'
import 'tippy.js/dist/backdrop.css'

const tippyOpts = {
  content: '',
  showOnCreate: true,
  allowHTML: true,
  interactive: true,
  trigger: 'manual',
  animation: 'scale',
  theme: 'light',
  maxWidth: 350,
  appendTo: document.querySelector('#app') as Element,
  inertia: true,
  moveTransition: 'transform 0.2s ease-out',
  popperOptions: {
    modifiers: [
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['bottom', 'right'],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          altAxis: true,
          tether: false,
        },
      },
    ],
  },
}

function showPopUp(
  id: string,
  shouldFocus: boolean,
  vueComp: VueConstructor<Vue>,
  editor: Editor,
  parent: any,
  tagName: string
) {
  const el = document.querySelector(`${ tagName }[data-id="${ id }"]`)
  if (el instanceof HTMLElement) {
    // it has already been created: show.
    const component = new VueRenderer(vueComp, { propsData: { id }, parent })
    console.log((el as any)._tippy)
    if ((el as any)._tippy !== undefined) {
      ((el as any)._tippy as TippyInstance).show()
    } else {
      const t = tippy(el, tippyOpts)
      t.setContent(component.element)
      if (shouldFocus) {
        requestAnimationFrame(() => {
          // eslint-disable-next-line no-unused-expressions
          t!.popper.querySelector('textarea')?.focus()
        })
      }
      t.popper.addEventListener('keyup', (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          t!.hide()
          editor.chain().focus().run()
        }
      })
    }
  }
}

const ex = Mark.create({
  defaultOptions: {
    component: Vue,
    tagName: ''
  },
  addAttributes() {
    return {
      hasPopUp: true
    }
  },
  onSelectionUpdate() {
    // console.log(this.name, 'this.name', this.editor, this.editor.isActive(this.name))
    if (this.editor.isActive(this.name)) {
      const { id } = this.editor.getAttributes(this.name)
      if (typeof id === 'string') {
        showPopUp(id, false, this.options.component, this.editor, this.parent, this.options.tagName)
      }
    }
  }
})

export default ex
