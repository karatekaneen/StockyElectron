<template>
	<v-container>
		<v-card>
			<v-btn @click="getSignals">signals</v-btn>
			<v-btn @click="testAllStocks">test all</v-btn>
			<v-btn @click="testPortfolio">test portfolio</v-btn>
			<v-btn @click="loadStock">load</v-btn>
			<v-text-field label="Regular" single-line v-model="stockId" />
			<!-- <v-btn @click="response.createLineSeries()">line</v-btn> -->
			<!-- <v-btn @click="d.push(response.dataSeries[0])">add 0</v-btn> -->
			<!-- <v-btn @click="d.push(response.dataSeries[1])">add 1</v-btn> -->
			<!-- <v-btn @click="d = [d[0]]">remove 0</v-btn> -->
			<!-- <v-btn @click="d = [d[1]]">remove 1</v-btn> -->
			<!-- <StockList /> -->
			<Chart v-if="response" :chartData="d" />
			<RadialChart width="50%" />
			<BacktestTable />
			<SignalTable />
		</v-card>
	</v-container>
</template>

<script>
import Chart from './Chart'
import { ipcRenderer } from 'electron'
import Stock from '../models/Stock'
// import StockList from './StockList'
import SignalTable from './SignalTable'
import RadialChart from './charts/RadialChart'
import BacktestTable from './BacktestTable'
import DataSeries from '../models/DataSeries'
export default {
	components: {
		Chart,
		SignalTable,
		BacktestTable,
		RadialChart
		// StockList
	},

	data: () => ({
		response: null,
		d: [],
		stockId: null
	}),

	methods: {
		getSignals() {
			ipcRenderer.on('get-signals', (event, arg) => {
				console.log('response', arg)
			})
			ipcRenderer.send('get-signals', { id: parseInt(this.stockId) })
		},

		testAllStocks() {
			ipcRenderer.on('test-all-stocks', (event, results) => {
				results.s.forEach(sig => {
					console.log(sig.stock.name, sig.action)
				})

				console.log('response', results)
			})
			ipcRenderer.send('test-all-stocks')
		},
		testPortfolio() {
			ipcRenderer.on('portfolio-test', (event, res) => {
				res.forEach((results, index) => {
					console.log('response', results)
					this.d.push(
						new DataSeries({
							name: 'Portfolio' + index,
							type: 'line',
							data: results.filter(({ value }) => value || value === 0 || value === null)
						})
					)
				})
				this.response = true
			})

			ipcRenderer.send('portfolio-test')
		},

		loadStock() {
			ipcRenderer.on('single-stock-response', (event, arg) => {
				console.log('response', Object.keys(arg))
			})
			ipcRenderer.send('single-stock', { id: 5234 })
		}
	}
}
</script>
