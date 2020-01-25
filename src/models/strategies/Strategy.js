import _Signal from '../Signal'

export default class Strategy {
	constructor({
		strategyName = 'flipper',
		initialContext,
		signalFunction,
		openPositionPolicy = 'conservative',
		Signal = _Signal
	} = {}) {
		this.Signal = Signal
		this.context = initialContext
		this.strategyName = strategyName
		this.openPositionPolicy = openPositionPolicy

		if (signalFunction) {
			this.processBar = signalFunction
		}
	}

	// TODO Make async to avoid blocking?
	test({ stock, startDate, endDate, initialContext = this.context } = {}) {
		const { priceData, ...stockSummary } = stock

		const testData = this.extractData({ priceData, startDate, endDate })

		// TODO It may be a good idea to refactor to pass all the data and index instead to allow for more complex calculations etc.
		// ? Maybe the better way is to add ability to override the default test function
		// Run the test in a reduce:
		const {
			signals,
			contextHistory,
			context,
			pendingSignal,
			closeOpenPosition
		} = testData.reduce(
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

						aggregate.closeOpenPosition = this.handleOpenPositions({
							signals: aggregate.signals,
							currentBar,
							context: aggregate.context,
							stock: stockSummary
						})
					}
				}

				return aggregate
			},
			// Initial values:
			{
				signals: [],
				context: initialContext,
				contextHistory: [initialContext],
				pendingSignal: null,
				closeOpenPosition: null
			}
		)

		const trades = this.summarizeSignals({ signals, priceData, closeOpenPosition })

		return { signals, contextHistory, context, pendingSignal, closeOpenPosition }
	}

	/**
	 * Generates an exit signal if there is any open positions at the end of the test.
	 *
	 * This enables both excluding of the open positions as well as calculating the open
	 * profit/loss for testing purposes. Will probably become handy when dealing with strategies
	 * that has very long-running positions. Note that if the `openPositionPolicy` is set to 'conservative'
	 * the signal price is set to the "guaranteed" exit compared to when it it set to 'optimistic'
	 * the signal price is set to the last close.
	 *
	 * @param {Object} params
	 * @param {Array<Object>} params.signals All the signals generated in the test
	 * @param {Object} params.currentBar the last bar to add data to the signal
	 * @param {Object} params.context The current context from the last bar
	 * @param {Object} params.stock The stock being tested
	 * @param {String} params.openPositionPolicy Decides what the price in the exit signal should be based on.
	 * @param {Object} deps
	 * @param {Signal} deps.Signal The Signal class
	 * @returns {Signal | null} The signal if there is any open positions, else null.
	 */
	handleOpenPositions(
		{ signals, currentBar, context, stock, openPositionPolicy = this.openPositionPolicy },
		{ Signal = this.Signal } = {}
	) {
		let closeOpenPosition = null

		// Odd number of signals is a tell of open position:
		const isSignalsLengthOdd = signals.length % 2 === 1

		// The last order type is also a tell of open positions:
		const isLastSignalEnter = signals[signals.length - 1].type === 'enter'

		// Check for open positions:
		if (isSignalsLengthOdd && isLastSignalEnter) {
			// There is an open position

			if (openPositionPolicy === 'conservative' || openPositionPolicy === 'exclude') {
				/*
				If the openPositionPolicy the open p/l is calculated on where the "guaranteed" exit will be,
				ie. the trailing trigger price for the exit
				*/
				closeOpenPosition = new Signal({
					stock,
					action: 'sell',
					type: 'exit',
					price: context.triggerPrice,
					date: currentBar.date
				})
			} else if (openPositionPolicy === 'optimistic') {
				/*
				If, on the other hand, the policy is optimistic the open p/l will be calculated as
				the latest close.
				*/
				closeOpenPosition = new Signal({
					stock,
					action: 'sell',
					type: 'exit',
					price: currentBar.close,
					date: currentBar.date
				})
			}
		} else if (isSignalsLengthOdd && !isLastSignalEnter) {
			// ! Logic error somewhere :(
			throw new Error(
				'Logic error found. Uneven length on signal array and last signal was to exit'
			)
		}

		return closeOpenPosition
	}

	summarizeSignals({ signals, priceData, closeOpenPosition }) {
		const numberOfSignals = signals.length

		if (numberOfSignals > 0) {
			const isOddNumber = numberOfSignals % 2 === 1
			const lastSignalType = signals[signals.length - 1].type

			// Early indication that something is wrong
			if ((isOddNumber && !closeOpenPosition) || (!isOddNumber && lastSignalType === 'enter')) {
				throw new Error('No exit signal for open position provided')
			}

			const trades = []
			// https://medium.com/@Dragonza/four-ways-to-chunk-an-array-e19c889eac4
			return trades
		} else {
			return []
		}
	}

	groupSignals(signals, groupSize = 2) {
		let index = 0
		const output = []

		// Split up the array into smaller arrays of 2
		while (index < signals.length) {
			output.push(signals.slice(index, groupSize + index))
			index += groupSize
		}

		// Check if it has invalid structure
		const hasInvalidSignals = output.some(arr => {
			const isInvalidLength = arr.length !== 2
			const hasInvalidSignalTypes =
				(arr[0] && arr[0].type !== 'enter') || (arr[1] && arr[1].type !== 'exit')
			// TODO Add optional chaining here when able to.

			return isInvalidLength || hasInvalidSignalTypes
		})

		if (hasInvalidSignals) {
			throw new Error('Invalid sequence or number of signals')
		}

		return output
	}

	processBar() {
		throw new Error('No signal function has been provided')
	}

	extractData({ priceData, startDate, endDate }) {
		return priceData
	}
}
