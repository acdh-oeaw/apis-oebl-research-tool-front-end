/* eslint-disable */

import { expect } from 'chai'
import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import { Content as TipTapContent, Editor as TipTapEditor } from "@tiptap/vue-2"
import TipTapStarterKit from "@tiptap/starter-kit";
import Editor from '../../../src/views/ArticleManager/Editor.vue'
import flushPromises from 'flush-promises'
import Vuetify from 'vuetify'
import Vue from 'vue'
import { VBtn, VSlideItem } from 'vuetify/lib';
Vue.use(Vuetify)
const vuetify = new Vuetify()
const localVue = createLocalVue();
(global as any).requestAnimationFrame = () => 0

async function renderComponent(props: any) {
  const wrapper = mount(Editor, { localVue, vuetify, propsData: props })
  await flushPromises()
  return wrapper
}

describe('Editor.vue', async () => {

  let wrapper: Wrapper<Vue>;
  const mockLemmaArticleVersion = {
    "lemma_article": 1,
    "markup": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "text": "test",
              "type": "text"
            }
          ]
        }
      ]
    },
    "date_created": "2023-01-11T11:32:31.373261+01:00",
    "date_modified": "2023-01-11T11:56:14.371436+01:00",
    "id": 1
  }

  before(async () => {

    const tipTapEditor = new TipTapEditor({
      content: mockLemmaArticleVersion.markup as TipTapContent,
      editable: true,
      extensions: [TipTapStarterKit],
    });


    wrapper = await renderComponent({
      version: mockLemmaArticleVersion,
      tipTapEditor: tipTapEditor,
      articleStore: null,
      userCanAnnotate: true,
      userCanComment: true
    })
  })
  it("creates and displays editor with correctly parsed data", async () => {
    expect(wrapper.element.querySelector('.editor-title')?.textContent).to.equal("Version vom 11.1.2023, 11:32:31")
    expect(wrapper.element.querySelector('.ProseMirror')?.innerHTML).to.equal("<p>test</p>")
    // the tooltips havent got more specific identifiers, so we use tb-tooltip for now and test the first one
    expect(wrapper.element.querySelector('.tb-tooltip')?.innerHTML).to.equal("<div>Zuletzt gespeichert</div><div>11.1.2023, 11:56:14</div>")
  })
})
