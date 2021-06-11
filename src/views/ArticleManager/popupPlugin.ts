import { Editor, getMarkAttributes } from '@tiptap/core'
import { Command, Mark, VueRenderer } from '@tiptap/vue-2'
import tippy, { hideAll, Instance as TippyInstance } from 'tippy.js'
import Vue, { VueConstructor } from 'vue'

import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale.css'
import 'tippy.js/themes/light.css'
import 'tippy.js/dist/backdrop.css'

function updateComponent(id: string, attrs: any, tagName: string, editor: Editor) {
  console.log('update component, yo', id, attrs, tagName)
  const el = document.querySelector(`${ tagName }[data-id="${ id }"]`)
  if (el instanceof HTMLElement) {
    // it has already been created: show.
    console.log((el as any))
    if ((el as any)._vueComponent !== undefined) {
      ((el as any)._vueComponent as VueRenderer).updateProps({
        ...attrs,
        editor
      });
      (el as any)._tippy.content = (el as any)._vueComponent.element
    }
  }
}

function showPopUp(
  id: string,
  shouldFocus: boolean,
  vueComp: VueConstructor<Vue>,
  attributes: any,
  editor: Editor,
  parent: any,
  tagName: string
) {
  const el = document.querySelector(`${ tagName }[data-id="${ id }"]`)
  if (el instanceof HTMLElement) {
    // it has already been created: show.
    if ((el as any)._tippy !== undefined) {
      ((el as any)._tippy as TippyInstance).show()
    } else {
      (el as any)._vueComponent = new VueRenderer(vueComp, {
        propsData: {
          ...attributes,
          editor
        },
        parent
      })
      const t = tippy(el, {
        content: (el as any)._vueComponent.element,
        showOnCreate: true,
        allowHTML: true,
        interactive: true,
        trigger: 'manual',
        animation: 'scale',
        placement: 'bottom',
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
              }
            }
          ]
        }
      })
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
  onTransaction({ transaction }) {
    // when adding a mark of this class, open the pop up
    const isAddingTypeMark = transaction.steps.find(s => s.toJSON().stepType === 'addMark' && s.toJSON().mark.type === this.name)
    if (isAddingTypeMark) {
      const isUpdate = transaction.steps.find(s => s.toJSON().stepType === 'removeMark' && s.toJSON().mark.type === this.name)
      const attrs = this.editor.getAttributes(this.name)
      // but don’t do it if it’s just an update (i. e. when it’s removed in the same transaction)
      if (!isUpdate) {
        if (typeof attrs.id === 'string') {
          showPopUp(
            attrs.id,
            true,
            this.options.component,
            attrs,
            this.editor,
            this.parent,
            this.options.tagName
          )
        }
      } else {
        updateComponent(attrs.id, attrs, this.options.tagName, this.editor)
      }
    }
  },
  onSelectionUpdate() {
    if (this.editor.isActive(this.name)) {
      const attrs = this.editor.getAttributes(this.name)
      if (typeof attrs.id === 'string') {
        showPopUp(
          attrs.id,
          false,
          this.options.component,
          attrs,
          this.editor,
          this.parent,
          this.options.tagName
        )
      }
    } else {
      hideAll()
    }
  }
})

export default ex
