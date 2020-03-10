import Vue from 'vue'
import Vuex from 'vuex'
import { ipcRenderer } from 'electron'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		allStocks: [],
		selectedStock: null,
		isLoadingAllStocks: false,
		testResults: [
			{
				groupName: 'Large Cap Stockholm',
				wins: 861,
				losses: 1265,
				numberOfTrades: 2126,
				totalGains: 347.1100497175999,
				totalLoss: -150.92083198721838,
				maxGain: 4.844714686623012,
				maxLoss: -0.6851574212893553,
				winrate: 0.40498588899341487,
				loserate: 0.5950141110065852,
				averageTrade: 0.0922809114442058,
				averageWin: 0.4031475606476189,
				averageLoss: -0.11930500552349278,
				gainLossRatio: 3.3791336656720046,
				profitFactor: 2.299947894184661,
				tradeSTD: 0.43583271784449434,
				winSTD: 0.5473633017650598,
				lossSTD: 0.0697234739375488
			},
			{
				groupName: 'Mid Cap Stockholm',
				wins: 858,
				losses: 1306,
				numberOfTrades: 2164,
				totalGains: 351.9632036700681,
				totalLoss: -164.06891190608954,
				maxGain: 14.466666666666667,
				maxLoss: -0.7851851851851852,
				winrate: 0.39648798521256934,
				loserate: 0.6035120147874307,
				averageTrade: 0.08682730673011947,
				averageWin: 0.41021352409098844,
				averageLoss: -0.12562703821293228,
				gainLossRatio: 3.265328307714257,
				profitFactor: 2.1452156876101323,
				tradeSTD: 0.5496511049850767,
				winSTD: 0.7617035911032397,
				lossSTD: 0.0761908371264162
			},
			{
				groupName: 'Small Cap Stockholm',
				wins: 758,
				losses: 1593,
				numberOfTrades: 2351,
				totalGains: 268.11531784803924,
				totalLoss: -216.62628126298785,
				maxGain: 5.676330345222201,
				maxLoss: -0.7674418604651163,
				winrate: 0.32241599319438535,
				loserate: 0.6775840068056146,
				averageTrade: 0.021900908798405526,
				averageWin: 0.35371413964121273,
				averageLoss: -0.1359863661412353,
				gainLossRatio: 2.601100019643481,
				profitFactor: 1.237686010602485,
				tradeSTD: 0.3693808660970211,
				winSTD: 0.4976705760999801,
				lossSTD: 0.07918297510175518
			}
		]
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
