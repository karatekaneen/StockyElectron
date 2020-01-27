import _Signal from '../Signal'
import _Trade from '../Trade'

export default class Strategy {
	constructor({
		strategyName = 'flipper',
		initialContext,
		signalFunction,
		openPositionPolicy = 'conservative',
		Signal = _Signal,
		Trade = _Trade
	} = {}) {
		this.Signal = Signal
		this.Trade = Trade
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
	 * @param {Array<Signal>} params.signals All the signals generated in the test
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

	/**
	 * Converts all of the raw signals into an array of Trades to be more easily parsable later on.
	 * @param {Object} params
	 * @param {Array<Signal>} params.signals All the signals from the test
	 * @param {Array<Object>} params.priceData All the pricedata for this stock
	 * @param {Signal|null} params.closeOpenPosition The signal generated to keep track of open profit/loss
	 * @param {String} params.openPositionPolicy How the open positions should be handled at the end of the test
	 * @param {Object} deps
	 * @param {Class} deps.Trade The trade class
	 * @returns {Array<Trade>} List of trades.
	 */
	summarizeSignals(
		{ signals, priceData, closeOpenPosition, openPositionPolicy = this.openPositionPolicy },
		{ Trade = this.Trade } = {}
	) {
		const numberOfSignals = signals.length

		if (numberOfSignals > 0) {
			const isOddNumber = numberOfSignals % 2 === 1
			const lastSignalType = signals[signals.length - 1].type

			// Early indication that something is wrong
			if ((isOddNumber && !closeOpenPosition) || (!isOddNumber && lastSignalType === 'enter')) {
				throw new Error('No exit signal for open position provided')
			}

			// Group the entries and exits together
			const groupedSignals = this.groupSignals({ signals, closeOpenPosition })

			// Add the data between entry and exit
			const groupedSignalsWithPriceData = this.assignPriceData({ groupedSignals, priceData })

			// Convert the signal groups to Trade instances
			const trades = groupedSignalsWithPriceData.map(
				({ entrySignal, exitSignal, tradeData }) =>
					new Trade({ entrySignal, exitSignal, tradeData })
			)

			// If the policy is to exclude open positions from result, pop the last item
			if (openPositionPolicy === 'exclude' && closeOpenPosition) {
				trades.pop()
			}

			return trades
		} else {
			return []
		}
	}

	/**
	 * Takes a nested array of signals (entry and exit) and all of the pricedata and attaches all the price
	 * data between entry and exit to the signals. It is returned as an array of objects instead of nested array.
	 * @param {Object} params
	 * @param {Array<Array<Signal>>} params.groupedSignals Grouped signals with entry and exit
	 * @param {Array<Object>} params.priceData The pricedata from the stock where the signals were generated.
	 * @returns {Array<Object} Outputs object with `entrySignal`, `exitSignal` and `tradeData` which is the pricedata between entry and exit
	 */
	assignPriceData({ groupedSignals, priceData }) {
		let priceClone = [...priceData]

		const signalsWithPriceData = groupedSignals.map(([entrySignal, exitSignal]) => {
			const { startIndex, endIndex } = this.extractData({
				priceData: priceClone,
				startDate: entrySignal.date,
				endDate: exitSignal.date
			})

			// Get all the data that was produced during the trade
			const tradeData = priceClone.slice(startIndex, endIndex)

			// Update the data array to have to search less data next time
			priceClone = priceClone.slice(endIndex)

			return { entrySignal, exitSignal, tradeData }
		})

		return signalsWithPriceData
	}

	/**
	 * Groups signals 2 by 2, with entry and exit to later on be created as Trades
	 * @param {Object} params parameters
	 * @param {Array<Signal>} params.signals The signals generated in the test
	 * @param {Signal|null} params.closeOpenPosition The signal to close open positions if there are any
	 * @param {Number} params.groupSize How many signals it should be in every group. Defaults to 2 because entry and exit
	 * @returns {Array<Array<Signal>>} Nested arrays with signals in groups of 2 (by default)
	 */
	groupSignals({ signals, closeOpenPosition, groupSize = 2 }) {
		const signalList = [...signals]

		if (closeOpenPosition) {
			signalList.push(closeOpenPosition)
		}

		let index = 0
		const output = []

		// Split up the array into smaller arrays of 2
		while (index < signalList.length) {
			output.push(signalList.slice(index, groupSize + index))
			index += groupSize
		}

		// Check if it has invalid structure
		const hasInvalidSignals = output.some(arr => {
			const isInvalidLength = arr.length !== 2
			const hasInvalidSignalTypes =
				!arr[0] || arr[0].type !== 'enter' || !arr[1] || arr[1].type !== 'exit'
			// TODO Add optional chaining here when able to.

			return isInvalidLength || hasInvalidSignalTypes
		})

		if (hasInvalidSignals) {
			throw new Error('Invalid sequence or number of signals')
		}

		return output
	}

	/**
	 * This is the main function to run the tests but since this is
	 * a class meant to be extended each strategy has to override this.
	 */
	processBar() {
		throw new Error('No signal function has been provided')
	}

	/**
	 * Gets the start and end index of the data between the start- and endDate.
	 * @param {Object} params
	 * @param {Array<Object>} params.priceData Array of price data to grab data from
	 * @param {Date} params.startDate The first date to include
	 * @param {Date} params.endDate The last date to include
	 * @returns {Object} with the `startIndex` and `endIndex` props.
	 */
	extractData({ priceData, startDate, endDate }) {
		const output = { startIndex: 0, endIndex: priceData.length }

		if (startDate) {
			output.startIndex = this.searchForDate({ priceData, date: startDate })
		}

		if (endDate) {
			output.endIndex = this.searchForDate({ priceData, date: endDate })
		}

		return output
	}

	/**
	 * Logic like a binary search tree, almost at least.
	 * If the mid item is equal to the target date or the mid item is greater than the target date but the previous is less the mid gets returned.
	 *
	 * If the mid item is GREATER than the target date it recursively calls itself but with the mid as
	 * the "cap" of the searching.
	 *
	 * If the mid item is LESS than the target date it recursively calls itself but with the mid index
	 * as the lower limit for searching.
	 *
	 * If the mid item is less than the target date but the next is larger - mid +1  gets returned.
	 *
	 * @param {Object} params
	 * @param {Array<Object>} params.priceData The price data to search for the target date
	 * @param {Date} params.date The date to search for
	 * @param {Number} params.upperLimit The max index to search for, used to limit down the searches logarithmically
	 * @param {Number} params.lowerLimit The min index to search for, used to limit down the searches logarithmically
	 * @returns {Number} The index of the target date or the one closest
	 */
	searchForDate({ priceData, date, upperLimit = null, lowerLimit = null }) {
		if (date < priceData[0].date || date > priceData[priceData.length - 1].date) {
			// ? Should this really throw when date < priceData[0].date or rather return 0?

			throw new Error('Date is not within provided interval')
		}

		// Assign the upper and lower limits of where to search in the array
		const upper = upperLimit || priceData.length
		const lower = lowerLimit || 0

		// Get the middle index
		const mid = Math.floor((upper + lower) / 2)

		if (
			priceData[mid].date.getTime() === date.getTime() ||
			(priceData[mid].date > date && priceData[mid - 1].date < date)
		) {
			// Bullseye returning mid
			return mid
		} else if (priceData[mid].date < date && priceData[mid + 1].date > date) {
			// Almost, there is no exact match, returning next item
			return mid + 1
		} else if (priceData[mid].date > date) {
			// Search lower half recursively
			return this.searchForDate({ priceData, date, upperLimit: mid, lowerLimit: lower })
		} else if (priceData[mid].date < date) {
			// Search upper half recursively
			return this.searchForDate({ priceData, date, upperLimit: upper, lowerLimit: mid })
		} else {
			// ! You fucked up
			throw new Error('Logic error :C ')
		}
	}
}
