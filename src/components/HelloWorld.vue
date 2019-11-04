<template>
	<v-container>
		<v-card>
			<v-btn @click="testmetod">skf</v-btn>
			<v-btn @click="response.createLineSeries()">line</v-btn>
			<v-btn @click="d.push(response.dataSeries[0])">add 0</v-btn>
			<v-btn @click="d.push(response.dataSeries[1])">add 1</v-btn>
			<v-btn @click="d = [d[0]]">remove 0</v-btn>
			<v-btn @click="d = [d[1]]">remove 1</v-btn>
			<Chart v-if="response" :chartData="d" />
			<StockList />
		</v-card>
	</v-container>
</template>

<script>
import Chart from './Chart'
import { ipcRenderer } from 'electron'
import Stock from '../models/Stock'
import StockList from './StockList'
export default {
	components: {
		Chart,
		StockList
	},
	data: () => ({
		response: null,
		d: []
	}),
	methods: {
		testmetod() {
			ipcRenderer.on('single-stock-response', (event, arg) => {
				const s = new Stock({ data: arg })
				s.createCandlestickSeries()
				this.response = s
			})
			ipcRenderer.send('single-stock', { id: 5234 })
		}
	}
}
</script>
