<template>
	<v-card>
		<div id="chartdiv"></div>
	</v-card>
</template>

<script>
import { createChart } from 'lightweight-charts'

export default {
	props: ['chartData'],
	watch: {
		chartData(newChart, oldChart) {}
	},
	data() {
		return {
			chart: null,
			chartSeries: []
		}
	},

	methods: {
		createChartInstance() {
			this.chart = createChart('chartdiv', { width: 800, height: 600 })
		}
	},

	mounted() {
		this.createChartInstance()
	}
}
</script>

<style scoped>
</style>