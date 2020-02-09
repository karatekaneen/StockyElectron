<template>
	<v-container>
		<v-card>
			<v-btn @click="testmetod">test</v-btn>
			<v-btn @click="testAllStocks">test all</v-btn>
			<v-btn @click="loadStock">load</v-btn>
			<v-text-field label="Regular" single-line v-model="stockId" />
			<!-- <v-btn @click="response.createLineSeries()">line</v-btn> -->
			<!-- <v-btn @click="d.push(response.dataSeries[0])">add 0</v-btn> -->
			<!-- <v-btn @click="d.push(response.dataSeries[1])">add 1</v-btn> -->
			<!-- <v-btn @click="d = [d[0]]">remove 0</v-btn> -->
			<!-- <v-btn @click="d = [d[1]]">remove 1</v-btn> -->
			<!-- <StockList /> -->
			<Chart v-if="response" :chartData="d" />
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
export default {
	components: {
		Chart,
		SignalTable
		// StockList
	},

	data: () => ({
		response: null,
		d: [],
		stockId: null
	}),

	methods: {
		testmetod() {
			ipcRenderer.on('test-strategy-response', (event, arg) => {
				console.log('response', arg)
			})
			ipcRenderer.send('test-strategy', { id: parseInt(this.stockId) })
		},

		testAllStocks() {
			ipcRenderer.on('test-all-stocks', (event, results) => {
				console.log('response', results)
			})
			ipcRenderer.send('test-all-stocks')
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
