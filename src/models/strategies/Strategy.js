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
		const testData = this.extractData({ priceData: stock.priceData, startDate, endDate })

		// TODO It may be a good idea to refactor to pass all the data and index instead to allow for more complex calculations etc.
		// ? Maybe the better way is to add ability to override the default test function
		// Run the test in a reduce:
		const { signals, contextHistory, context } = testData.reduce(
			(aggregate, currentBar, index, originalArr) => {
				if (index > 0) {
					const { signal, context: newContext } = this.getSignal({
						signalBar: originalArr[index - 1],
						currentBar,
						stock,
						context: aggregate.context
					})

					// Update context
					aggregate.contextHistory.push(newContext)
					aggregate.context = newContext

					// Add signal to array if there is any
					if (signal) {
						aggregate.signals.push(signal)
					}
				}

				return aggregate
			},
			// Initial values:
			{ signals: [], context: initialContext, contextHistory: [initialContext] }
		)

		return { signals, contextHistory, context }
		// this.getSignal()
	}

	getSignal() {
		throw new Error('No signal function has been provided')
	}

	extractData({ priceData, startDate, endDate }) {
		return []
	}
}
