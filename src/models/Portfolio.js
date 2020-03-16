import _Trade from './Trade'
import _Fee from './Fee'

class Portfolio {
	// these need to be created to avoid Jest from throwing:
	#Trade = null

	cashAvailable = 0
	historicalTrades = []
	openTrades = []
	#availableSlots = 0

	constructor(
		{
			startCapital = 100000,
			maxNumberOfStocks = 20,
			selectionMethod = 'random',
			fee,
			feePercentage = 0.0025,
			feeMinimum = 1
		} = {},
		{ Trade = _Trade, Fee = _Fee } = {}
	) {
		this.#Trade = Trade

		this.startCapital = startCapital
		this.cashAvailable = startCapital
		this.maxNumberOfStocks = maxNumberOfStocks
		this.#availableSlots = maxNumberOfStocks
		this.selectionMethod = selectionMethod
		this.fee = fee || new Fee({ percentage: feePercentage, minimum: feeMinimum })
	}

	get openPositions() {
		return this.maxNumberOfStocks - this.#availableSlots
	}

	backtest({ trades, fee = this.fee, Trade = this.#Trade }) {
		/*
		1. Generate date map from signals within trades with object with entry & exit for each date
		2. Loop over the dates
			- Check for exits first for each day
				- Calculate fees? (Or has this already been done?)
				- Add cash to cashAvailable
				- Remove the stock from openTrades
			- Then, check if the portfolio has room for more stocks to be added
				- If there is room, check if there is any entry signals
				- Select the signals to be taken based on selectionMethod
				- Calculate quantity and set it to the trade instance
				- Calculate fees & add it to the trade instance
				- "Withdraw" cash from cashAvailable
		3. Generate portfolio equity curve
			- Get all the pricedata for each trade and generate daily curve
		4. Sumarize + analyze portfolio
		*/

		// Reset the cash available just in case this isn't the first test ran on this instance
		this.cashAvailable = this.startCapital

		const currentlyHolding = new Map()
		const signalMap = this.generateSignalMaps(trades)

		signalMap.forEach(({ entry, exit }, date) => {
			const tradesToClose = currentlyHolding.get(date)
			if (tradesToClose) {
				tradesToClose.forEach(trade => {
					this.historicalTrades.push(trade)
					this.cashAvailable += trade.finalValue
					this.#availableSlots++
				})

				currentlyHolding.delete(date)
			}

			if (this.#availableSlots && entry.length > 0) {
				const tradesToOpen = this.rankSignals(entry, this.selectionMethod)
					.slice(0, this.#availableSlots)
					.forEach(t => {
						/*
						t might be pure JSON if it's loaded from db and not directly from the test.
						Then it needs to be instantiated to be able to use the Trade class' methods.
						*/
						const trade = t instanceof Trade ? t : new Trade(t)
						const dateString = trade.exit.date.toISOString()

						const maxPositionValue = this.calculateMaxPositionValue(
							this.cashAvailable,
							fee,
							this.#availableSlots
						)

						const quantity = trade.calculateQuantity(maxPositionValue)

						if (quantity > 0) {
							trade.setQuantity(quantity)

							// "Withdraw cash"
							this.cashAvailable -= trade.initialValue

							// Remove slot from availability
							this.#availableSlots--

							const existingTrades = currentlyHolding.get(dateString)

							existingTrades
								? currentlyHolding.set(dateString, [...existingTrades, trade])
								: currentlyHolding.set(dateString, [trade])
						}
					})
			}
		})

		this.openTrades = currentlyHolding
	}

	/**
	 * Calculates the max amount to spend on a position.
	 * @param {number} cashAvailable The max amount of cash available
	 * @param {Fee} feeInstance Instance of Fee
	 * @param {number} availableSlots Number of open position slots that can be filled
	 * @returns {number} the max amount to buy a single stock for
	 */
	calculateMaxPositionValue(cashAvailable, feeInstance, availableSlots = this.#availableSlots) {
		return (cashAvailable - feeInstance.calculate(cashAvailable)) / availableSlots
	}

	rankSignals(trades, selectionMethod) {
		// TODO Make proper implementation
		return trades
	}

	/**
	 * Helper function to map signals to their respective dates.
	 * This is currently making the Map 2x the size from the Trade array,
	 * this maybe should be changed to a reference later.
	 *
	 * @todo Refactor to use reference instead?
	 * @param {Array<Trade>} trades
	 * @returns {Map} The trades grouped by dates
	 */
	generateSignalMaps(trades) {
		const signalMap = new Map()

		/**
		 * Assigns the trade to the date in the Map.
		 * @param {Trade} trade Trade instance
		 * @param {string} type the signal type
		 * @param {Date} date Date of the signal
		 * @returns {void}
		 */
		const getAndPush = (trade, type, date) => {
			if (signalMap.has(date.toISOString())) {
				const signals = signalMap.get(date.toISOString())
				signals[type].push(trade)
				signalMap.set(date.toISOString(), signals)
			} else {
				const signals = {
					entry: [],
					exit: [] // TODO The exit may not be used so maybe remove it and only assign an empty object if type is exit?
				}

				signals[type].push(trade)
				signalMap.set(date.toISOString(), signals)
			}
		}

		trades.forEach(trade => {
			// Add the trades to the Map
			getAndPush(trade, 'entry', trade.entry.date)
			getAndPush(trade, 'exit', trade.exit.date)
		})

		const sortedSignalArr = [...signalMap.entries()].sort(([first], [second]) =>
			new Date(first) < new Date(second) ? -1 : 1
		)

		return new Map(sortedSignalArr)
	}
}

export default Portfolio
