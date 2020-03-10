<template>
	<div>
		<apexchart
			type="radialBar"
			width="50%"
			height="350"
			:options="chartOptions"
			:series="series"
		></apexchart>
	</div>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
export default {
	components: {
		apexchart: VueApexCharts
	},
	data() {
		return {
			series: [40.5],
			chartOptions: {
				chart: {
					height: 350,
					type: 'radialBar',
					toolbar: {
						show: false
					}
				},
				plotOptions: {
					radialBar: {
						// startAngle: -110,
						// endAngle: 110,
						hollow: {
							margin: 0,
							size: '70%',
							background: '#FBF9F8',
							image: undefined,
							imageOffsetX: 0,
							imageOffsetY: 0,
							position: 'front',
							dropShadow: {
								enabled: true,
								top: 3,
								left: 0,
								blur: 4,
								opacity: 0.34
							}
						},
						track: {
							background: '#99A6B6',
							strokeWidth: '75%',
							margin: 0, // margin is in pixels
							dropShadow: {
								enabled: true,
								top: -3,
								left: 0,
								blur: 4,
								opacity: 0.45
							}
						},

						dataLabels: {
							show: true,
							name: {
								offsetY: -10,
								show: true,
								color: '#888',
								fontSize: '17px'
							},
							value: {
								formatter: function(val) {
									return parseFloat(val).toFixed(1) + '%'
								},
								color: '#111',
								fontSize: '36px',
								show: true
							}
						}
					}
				},
				fill: {
					colors: ['#4C8CD4']
					// type: 'gradient',
					// gradient: {
					// 	shade: 'light',
					// 	// type: 'horizontal',
					// 	shadeIntensity: 0.1,
					// 	gradientToColors: ['#0F0'],
					// 	// inverseColors: true,
					// 	opacityFrom: 1,
					// 	opacityTo: 1,
					// 	stops: [0, 100]
					// }
				},
				stroke: {
					lineCap: 'round'
				},
				labels: ['Winrate']
			}
		}
	}
}
</script>

<style lang="scss" scoped></style>
