<template>
	<v-container>
		<v-card>
			<v-btn @click="testmetod">skf</v-btn>
			<v-btn @click="rem">test</v-btn>
			<div>{{response.name}}</div>
			<div>{{response.list}}</div>
			<div>{{response.lastPricePoint}}</div>
			<div id="chartdiv"></div>
		</v-card>
	</v-container>
</template>

<script>
import { ipcRenderer } from 'electron'
import { createChart } from 'lightweight-charts'
export default {
	data: () => ({
		response: '',
		response2: '',
		chart: null,
		candles: null,
		ma: null,
		backtest: null,
		lines: null,
		backtestLine: null
	}),
	methods: {
		testmetod() {
			ipcRenderer.on('asynchronous-reply', (event, arg) => {
				this.response = arg
				this.candles = this.chart.addCandlestickSeries()
				this.lines = this.chart.addLineSeries()
				this.backtestLine = this.chart.addLineSeries()

				this.response.priceData = this.response.priceData.map(pricePoint => {
					const d = new Date(pricePoint.date)
					pricePoint.time = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
					return pricePoint
				})

				this.ma = this.response.priceData.map(({ time, close }, index) => {
					if (index < 199) {
						return { time, value: null }
					} else {
						return {
							time,
							value: this.getAverage(
								this.response.priceData.slice(index - 199, index).map(p => p.close)
							)
						}
					}
				})
				this.backtest = this.getBacktest(this.response.priceData, this.ma)

				this.candles.setData(this.response.priceData)
				this.lines.setData(this.ma)
				this.backtestLine.setData(this.backtest)
				console.log(JSON.stringify(this.chart, null, 3))
			})
			ipcRenderer.send('asynchronous-message', { id: 5234 })
		},

		rem() {
			this.chart.removeSeries(this.backtestLine)
		},

		getBacktest(candles, ma) {
			const backtest = []

			candles.forEach(({ close, time }, index) => {
				let maVal = null
				if (index > 0) {
					maVal = ma[index - 1].value
				}

				if (maVal) {
					const lastVal = backtest[index - 1].value || close
					if (maVal < candles[index - 1].close) {
						const diff = close / candles[index - 1].close
						backtest.push({ time, value: lastVal * diff })
					} else {
						backtest.push({ time, value: backtest[index - 1].value })
					}
				} else {
					backtest.push({ time, value: null })
				}
			})

			return backtest
		},

		getAverage(arr) {
			return arr.reduce((acc, current) => acc + current) / arr.length
		}
	},
	mounted() {
		this.chart = createChart('chartdiv', { width: 800, height: 600 })
	}
}
</script>
