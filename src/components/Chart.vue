<template>
	<v-card>
		<div id="chartdiv"></div>
	</v-card>
</template>

<script>
export default {
	props: ['chartData'],

	watch: {
		chartData: {
			immediate: true,
			deep: true,
			handler(newValue, oldValue) {
				// RemoveCharts(newValue, oldValue)
				this.seriesToDisplay = newValue
				this.createChartSeries(this.seriesToDisplay)
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
		async createChartInstance() {
			const { createChart } = await import('lightweight-charts')
			this.chart = createChart('chartdiv', { width: 800, height: 600 })
		},

		createChartSeries(series) {
			console.log(series)
		}
	},

	mounted() {
		this.createChartInstance()
	}
}
</script>

<style scoped>
</style>