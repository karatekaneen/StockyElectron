<template>
	<v-card>
		<div id="chartdiv"></div>
	</v-card>
</template>

<script>
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
	mounted() {
		this.chart = createChart('chartdiv', { width: 800, height: 600 })
	}
}
</script>

<style lang="scss" scoped>
</style>