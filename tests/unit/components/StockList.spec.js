import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import StockList from '../../../src/components/StockList'
// import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
const localVue = createLocalVue()

localVue.use(Vuetify)
localVue.use(Vuex)

document.body.setAttribute('data-app', true)

describe.only('StockList', () => {
	let state
	let store
	let actions

	beforeEach(() => {
		state = {
			allStocks: [
				{ id: 5341, list: 'Small Cap Stockholm', name: 'ICTA' },
				{ id: 5267, list: 'Large Cap Stockholm', name: 'Trelleborg B' },
				{ id: 5239, list: 'Large Cap Stockholm', name: 'Ericsson A' }
			],
			isLoadingAllStocks: false
		}

		actions = {
			getAllStocks: jest.fn()
		}

		store = new Vuex.Store({ state, actions })
	})

	it('Renders a list item for every stock', () => {
		const wrapper = mount(StockList, { store, localVue })

		const x = wrapper.findAll('.v-list-item')
		expect(x.length).toBe(state.allStocks.length)
	})

	it('Calls getAllStocks on mount', () => {
		store.state.allStocks = []
		const wrapper = mount(StockList, { store, localVue })

		const x = wrapper.findAll('.v-list-item')
		expect(x.length).toBe(0)
		expect(actions.getAllStocks).toHaveBeenCalled()
	})

	it.todo('should set selected stock on click')
	it.todo('should be able to filter list')
	it.todo('should be able to search list')
})
