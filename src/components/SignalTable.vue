<template>
	<div>
		<v-data-table
			:headers="headers"
			:items="signals"
			:items-per-page="50"
			class="elevation-1"
		></v-data-table>
		<v-btn @click="getSignals">Load signals</v-btn>
	</div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
	data() {
		return {
			signals: [],
			headers: [
				{ value: 'date', text: 'Date' },
				{ value: 'stockName', text: 'Stock' },
				{ value: 'action', text: 'Action' },
				{ value: 'price', text: 'Price' },
				{ value: 'stockList', text: 'List' },
				{ value: 'type', text: 'Type' }
			]
		}
	},
	methods: {
		async getSignals() {
			ipcRenderer.on('get-signals', (event, signals) => {
				this.signals = signals.map(({ action, date, price, status, stock, type }) => {
					return {
						date,
						price,
						action,
						type,
						stockName: stock.name,
						stockList: stock.list
					}
				})
			})
			ipcRenderer.send('get-signals')
		}
	}
}
</script>

<style scoped></style>
