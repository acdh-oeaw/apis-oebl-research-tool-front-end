import { expect } from 'chai'
import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import HelloWorld from '@/components/ColumnMatcher.vue'
import { readFileSync } from 'fs'
import flushPromises from 'flush-promises'
import Vuetify from 'vuetify'
import Vue from 'vue'
// https://github.com/vuetifyjs/vuetify/issues/4861
// Vue.use(VueRouter)
Vue.use(Vuetify)
// require('jsdom-global/register')
const vuetify = new Vuetify()
const localVue = createLocalVue();

(global as any).requestAnimationFrame = (cb: () => number) => cb() as any

describe('ColumnMatcher.vue', () => {
  it('renders a CSV correctly', async () => {
    const msg = 'test'
    console.log(process.cwd())
    const f = readFileSync('./tests/unit/assets/oebl-export-subset.csv')
    const wrapper = mount(HelloWorld, {
      mocks: {
        $vuetify: {
          breakpoint: {
            mobile: {}
          }
        }
      },
      localVue,
      vuetify,
      propsData: {
        buffer: f,
        fileName: 'testFile.csv',
        fileType: 'text/csv',
        targetColumns: [
          {
            value: 'firstName',
            text: 'Vorname'
          },
          {
            value: 'lastName',
            text: 'Nachname'
          },
          {
            value: 'dateOfBirth',
            text: 'Geburtsdatum'
          },
          {
            value: 'dateOfDeath',
            text: 'Sterbedatum'
          },
          {
            value: 'placeOfDeath',
            text: 'Sterbeort'
          },
          {
            value: 'placeOfBirth',
            text: 'Geburtsort'
          },
          {
            value: 'gnd',
            text: 'GND'
          }
        ]
      }
    })
    await flushPromises()
    console.log(wrapper.text())
    expect(wrapper.text()).to.include('testFile.csv')
  })
})
