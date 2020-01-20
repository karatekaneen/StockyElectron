export default class Strategy {
	constructor({ strategyName = 'flipper', initialContext, signalFunction } = {}) {
		this.context = initialContext
		this.strategyName = strategyName

		if (signalFunction) {
			this.processBar = signalFunction
		}
	}

	test({ stock, startDate, endDate, initialContext = this.context } = {}) {
		const { priceData, ...stockSummary } = stock

		const testData = this.extractData({ priceData, startDate, endDate })

		// TODO It may be a good idea to refactor to pass all the data and index instead to allow for more complex calculations etc.
		// ? Maybe the better way is to add ability to override the default test function
		// Run the test in a reduce:
		const { signals, contextHistory, context, pendingSignal } = testData.reduce(
			(aggregate, currentBar, index, originalArr) => {
				if (index > 0) {
					const { signal, context: newContext } = this.processBar({
						signalBar: originalArr[index - 1],
						currentBar,
						stock: stockSummary,
						context: aggregate.context
					})

					// Update context
					aggregate.contextHistory.push(newContext)
					aggregate.context = newContext

					// Add signal to array if there is any
					if (signal) {
						aggregate.signals.push(signal)
					}

					// On the last bar, check for signals to be executed on the next open:
					if (index === originalArr.length - 1) {
						const { signal: pendingSignal } = this.processBar({
							signalBar: originalArr[index],
							currentBar: { open: null, high: null, low: null, close: null, date: null },
							stock: stockSummary,
							context: aggregate.context
						})

						// If any signals, add them to output
						if (pendingSignal) {
							aggregate.pendingSignal = pendingSignal
						}

						// Check for open positions:
						if (
							aggregate.signals.length % 2 === 1 &&
							aggregate.signals[aggregate.signals.length - 1].type === 'enter'
						) {
							// Open position
							console.log('Open')
						} else if (
							aggregate.signals.length % 2 === 1 &&
							aggregate.signals[aggregate.signals.length - 1].type === 'exit'
						) {
							// Logic error somewhere :(
							throw new Error(
								'Logic error found. Uneven length on signal array and last signal was to exit'
							)
						}
					}
				}

				return aggregate
			},
			// Initial values:
			{
				signals: [],
				context: initialContext,
				contextHistory: [initialContext],
				pendingSignal: null
			}
		)

		const trades = this.summarizeSignals({ signals, priceData })

		return { signals, contextHistory, context, pendingSignal }
	}

	summarizeSignals({ signals, priceData }) {
		const numberOfSignals = signals.length

		if (numberOfSignals > 0) {
			const trades = []

			return trades
		} else {
			return []
		}
	}

	processBar() {
		throw new Error('No signal function has been provided')
	}

	extractData({ priceData, startDate, endDate }) {
		return priceData
	}
}
