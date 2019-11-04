<template>
	<div>
		{{isLoadingAllStocks.toString()}}
		<v-btn @click="loadList">ladda</v-btn>
		<v-list two-line subheader>
			<v-subheader inset>Folders</v-subheader>

			<v-list-item v-for="stock in allStocks" :key="stock.id" @click="testMetod(stock)">
				<!-- <v-list-item-avatar>
					<v-icon :class="[item.iconClass]" v-text="item.icon"></v-icon>
				</v-list-item-avatar>-->

				<v-list-item-content>
					<v-list-item-title v-text="stock.name"></v-list-item-title>
					<v-list-item-subtitle v-text="stock.list"></v-list-item-subtitle>
				</v-list-item-content>

				<!-- <v-list-item-action>
					<v-btn icon>
						<v-icon color="grey lighten-1">mdi-information</v-icon>
					</v-btn>
				</v-list-item-action>-->
			</v-list-item>
		</v-list>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
	computed: mapState(['isLoadingAllStocks', 'allStocks']),
	methods: {
		loadList() {
			if (!this.isLoadingAllStocks && this.allStocks.length < 1) {
				this.getAllStocks()
			}
		},
		testMetod(x) {
			console.log(JSON.stringify(x))
		},
		...mapActions(['getAllStocks'])
	},
	mounted() {}
}
</script>

<style scoped>
</style>
