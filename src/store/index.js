import Vue from 'vue'
import Vuex from 'vuex'
import { ipcRenderer } from 'electron'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		allStocks: [],
		selectedStock: null,
		isLoadingAllStocks: false
	},
	mutations: {
		setAllStocks(state, stocks) {
			state.allStocks = stocks
		},

		setSelectedStock(state, stock) {
			state.selectedStock = stock
		},
		setisLoadingAllStocks(state, isLoadingAllStocks) {
			state.isLoadingAllStocks = isLoadingAllStocks
		}
	},
	actions: {
		getAllStocks({ commit, state }) {
			if (!state.isLoadingAllStocks) {
				ipcRenderer.on('all-stocks-summary-response', (event, arg) => {
					commit('setAllStocks', arg)
				})

				ipcRenderer.send('all-stocks-summary')
				commit('setisLoadingAllStocks', true)
			}
		},

		setSelectedStock({ commit }, stockId) {
			commit('setSelectedStock', stockId)
		}
	},
	modules: {}
})
