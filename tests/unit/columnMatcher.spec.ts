/* eslint-disable */ 

import { expect } from 'chai'
import { mount, createLocalVue, Wrapper } from '@vue/test-utils'
import ColumnMatcher from '@/components/ColumnMatcher.vue'
import { readFileSync } from 'fs'
import flushPromises from 'flush-promises'
import Vuetify from 'vuetify'
import Vue from 'vue'
Vue.use(Vuetify)
const vuetify = new Vuetify()
const localVue = createLocalVue();
(global as any).requestAnimationFrame = () => 0

async function renderComponent(props: any) {
  const wrapper = mount(ColumnMatcher, { localVue, vuetify, propsData: props })
  await flushPromises()
  return wrapper
}

describe('ColumnMatcher.vue', async () => {
  const exampleGuy = {
    lastName: 'Abbado',
    firstName: 'Claudio',
    placeOfBirth: 'Mailand/Milano',
    placeOfDeath: 'Bologna'
  }
  let wrapper: Wrapper<Vue>|null = null
  const csv = readFileSync('./tests/unit/assets/oebl-export-subset.csv')
  const xlsx = readFileSync('./tests/unit/assets/test-excel.xlsx')
  before(async () => {
    wrapper = await renderComponent({
      buffer: csv,
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
          value: 'placeOfDeath',
          text: 'Sterbeort'
        },
        {
          value: 'placeOfBirth',
          text: 'Geburtsort'
        },
      ]
    })
  })
  it('renders a CSV correctly', async () => {
    const t = wrapper!.text()
    expect(
      t.includes(exampleGuy.firstName) &&
      t.includes(exampleGuy.lastName) &&
      t.includes(exampleGuy.placeOfBirth) &&
      t.includes(exampleGuy.placeOfDeath)
    ).to.equal(true)
  })
  it('emits a correctly parsed JavaScript Object from a CSV', async () => {
    wrapper?.find('.test-confirm-button').trigger('click')
    const emitted = wrapper?.emitted()
    if (emitted && emitted.confirm && emitted.confirm[0]) {
      const d = emitted.confirm[0][0][0]
      // console.log('yo', d)
      expect(
        d.lastName === exampleGuy.lastName &&
        d.firstName === exampleGuy.firstName &&
        d.placeOfBirth === exampleGuy.placeOfBirth &&
        d.placeOfDeath === exampleGuy.placeOfDeath
      ).to.equal(true)
    } else {
      expect(false).to.equal(true)
    }
  })
  it('renders an Excel File correctly', async () => {
    wrapper = await renderComponent({
      buffer: xlsx,
      fileType: 'application/vnd.ms-excel',
      fileName: 'testFile.xls',
      targetColumns: [
        {
          value: 'Header 1',
          text: 'h1'
        },
        {
          value: 'Header 1',
          text: 'h2'
        },
        {
          value: 'Header3',
          text: 'h3'
        },
      ]
    })
    const t = wrapper!.text()
    expect(
      t.includes('Sheet 1 Cell 1') &&
      t.includes('Sheet 1 Cell 2') &&
      t.includes('Sheet 1 Cell 3')
    ).to.equal(true)
  })
  it('can switch between table sheets in Excel mode', async () => {
    (wrapper?.vm as any).updateSheetName!('Blatt 2')
    await flushPromises()
    const t = wrapper!.text()
    expect(
      t.includes('Sheet 2 Cell 1') &&
      t.includes('Sheet 2 Cell 2') &&
      t.includes('Sheet 2 Cell 3')
    ).to.equal(true)
  })
  it('does not emit a “confirm“ Event, if no columns are selected for import', async () => {
    wrapper!.find('.test-confirm-button').trigger('click')
    expect(wrapper!.emitted().confirm).to.equal(undefined)
  })
  it('can can select Columns for importing and emits them', async () => {
    (wrapper?.vm as any).matchHeaderWith!(0, 'firstName');
    (wrapper?.vm as any).matchHeaderWith!(1, 'lastName');
    await flushPromises()
    wrapper!.find('.test-confirm-button').trigger('click')
    const emitted = wrapper?.emitted('confirm')
    if (emitted && emitted[0]) {
      const d = emitted[0][0][0]
      expect(d).to.haveOwnProperty('firstName') && expect(d).to.haveOwnProperty('lastName')
    }
  })
  it('can emit ignored columns with custom prefixes', async () => {
    await wrapper?.setProps({
      returnIgnoredColumns: true,
      prefixIgnoredColumns: 'test-prefix.'
    })
    await flushPromises()
    wrapper!.find('.test-confirm-button').trigger('click')
    const emitted = wrapper?.emitted('confirm')
    if (emitted && emitted[1]) {
      const d = emitted[1][0][0]
      expect(d).to.haveOwnProperty('test-prefix.Header3 ')
    }
  })
})
