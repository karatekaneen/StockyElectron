export default class Strategy {
	constructor({ strategyName = 'flipper', initialContext, signalFunction } = {}) {
		this.context = initialContext
		this.strategyName = strategyName

		if (signalFunction) {
			this.getSignal = signalFunction
		}
	}

	test({
		stock,
		startDate,
		endDate = new Date().toISOString(),
		initialContext = this.context
	} = {}) {
		const signals = []

		const testData = this.extractData({ priceData: stock.priceData, startDate, endDate })

		console.log('Strategy - Test')

		// this.getSignal()
	}

	getSignal() {
		throw new Error('No signal function has been provided')
	}

	extractData({ priceData, startDate, endDate }) {
		return []
	}
}
