<template>
	<v-card>
		<v-btn @click="logit">test</v-btn>
		<div id="chartdiv"></div>
	</v-card>
</template>

<script>
import { cloneDeep } from 'lodash'
export default {
	props: ['chartData'],

	watch: {
		chartData: {
			deep: false,
			handler(newValue, oldValue) {
				// RemoveCharts(newValue, oldValue)
				const chartsToAdd = newValue.filter(series =>
					Boolean(!this.seriesToDisplay.map(x => x.name).includes(series.name))
				)
				const chartsToRemove = this.seriesToDisplay.filter(series =>
					Boolean(!newValue.map(x => x.name).includes(series.name))
				)

				if (chartsToAdd.length > 0) this.createChartSeries(chartsToAdd)
				if (chartsToRemove.length > 0) this.removeSeries(chartsToRemove)
			}
		}
	},
	data() {
		return {
			chart: null,
			chartSeries: [],
			seriesToDisplay: []
		}
	},

	methods: {
		logit() {
			const keys = Object.keys(this.seriesToDisplay[0])
			const clone = {}
			keys.forEach(key => {
				if (key !== 'chartDataSeries') {
					clone[key] = this.seriesToDisplay[0][key]
				}
			})
			delete clone.chartDataSeries

			console.log(JSON.stringify(clone, null, 3))
		},
		async createChartInstance() {
			const { createChart } = await import('lightweight-charts')
			this.chart = createChart('chartdiv', { width: 800, height: 600 })
			this.createChartSeries(this.chartData)
		},

		createChartSeries(series) {
			if (series && this.chart) {
				series.forEach(s => {
					if (s.type === 'candlestick') {
						s.chartDataSeries = this.chart.addCandlestickSeries()
					} else if (s.type === 'line') {
						s.chartDataSeries = this.chart.addLineSeries()
					}
					s.chartDataSeries.setData(s.data)
					this.seriesToDisplay.push(s)
				})
			}
		},

		removeSeries(unwantedSeries) {
			if (unwantedSeries.length < 1) throw new Error('unwantedSeries can not be empty')
			else if (this.seriesToDisplay.length < 1)
				throw new Error(
					'seriesToDisplay can not be empty before removal - There is a bug somewhere'
				)
			else {
				unwantedSeries.forEach(s => {
					this.chart.removeSeries(s.chartDataSeries)
					delete s.chartDataSeries
					this.seriesToDisplay = this.seriesToDisplay.filter(
						existing => existing.name !== s.name
					)
				})
			}
		}
	},

	created() {
		this.createChartInstance()
	}
}
</script>

<style scoped>
</style>
