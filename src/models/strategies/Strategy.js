export default class Strategy {
	constructor({ strategyName = 'flipper', initialContext } = {}) {
		this.context = initialContext
		this.strategyName = strategyName
	}

	test({ stock, startDate, endDate = Date.now(), initialContext = this.context } = {}) {
		const context = JSON.parse(JSON.stringify(initialContext))
		const signals = []

		console.log('Strategy - Test')

		this.getSignal()
	}
}
