<template>
	<div>
		<v-data-table
			:headers="headers"
			:items="testResults"
			:items-per-page="50"
			class="elevation-1"
		></v-data-table>
	</div>
</template>

<script>
export default {
	mounted() {
		this.testResults = this.loadData()
	},
	data() {
		return {
			testResults: [],
			headers: [
				{ value: 'groupName', text: 'Test Name' },
				{ value: 'numberOfTrades', text: '# Trades' },
				{ value: 'winrate', text: 'Win %' },
				{ value: 'profitFactor', text: 'Profit Factor' },
				{ value: 'averageTrade', text: 'Average Trade %' },
				{ value: 'averageWin', text: 'Average Win %' },
				{ value: 'averageLoss', text: 'Average Loss %' },
				{ value: 'gainLossRatio', text: 'Avg gain / Avg loss' },
				{ value: 'maxGain', text: 'Largest win %' },
				{ value: 'maxLoss', text: 'Largest loss %' }
			]
		}
	},

	methods: {
		loadData() {
			const rawData = [...this.$store.state.testResults]

			return rawData.map(test => {
				return {
					groupName: test.groupName,
					numberOfTrades: test.numberOfTrades,
					maxGain: this.quotaToPercent(test.maxGain),
					maxLoss: this.quotaToPercent(test.maxLoss),
					winrate: this.quotaToPercent(test.winrate),
					loserate: this.quotaToPercent(test.loserate),
					averageTrade: this.quotaToPercent(test.averageTrade),
					averageWin: this.quotaToPercent(test.averageWin),
					averageLoss: this.quotaToPercent(test.averageLoss),
					gainLossRatio: test.gainLossRatio.toFixed(2),
					profitFactor: test.profitFactor.toFixed(2)
				}
			})
		},

		quotaToPercent(num) {
			return (num * 100).toFixed(2) // (num * 100).toFixed(2)
		}
	}
}
</script>

<style scoped></style>
