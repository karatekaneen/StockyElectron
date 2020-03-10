class Portfolio {
	cashAvailable = 0
	historicalTrades = []
	openTrades = []
	availableSlots = 1

	constructor({ startCapital = 100000, maxNumberOfStocks = 20, selectionMethod = 'random' } = {}) {
		this.startCapital = startCapital
		this.cashAvailable = startCapital
		this.maxNumberOfStocks = maxNumberOfStocks
		this.selectionMethod = selectionMethod
	}

	backtest({ trades }) {
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

		const currentlyHolding = new Map()

		const signalMap = this.generateSignalMaps(trades)

		signalMap.forEach(({ entry, exit }, date) => {
			if (currentlyHolding.has(date)) {
				// TODO this.closeTrades(currentlyHolding.get(date))
				// TODO Ta bort currentlyHolding[date]
			}

			if (this.availableSlots) {
				const tradesToOpen = this.rankSignals(entry)
					.slice(0, this.availableSlots)
					.forEach(trade => {
						const dateString = trade.exit.date.toISOString()

						// TODO Calculate quantity here
						// TODO only continue if quantity > 0 (this can maybe favour stocks with lower prices, wanted behavior?)
						// TODO "withdraw" cash here

						const existingTrades = currentlyHolding.get(dateString)

						existingTrades
							? currentlyHolding.set(dateString, [...existingTrades, trade])
							: currentlyHolding.set(dateString, [trade])
					})
			}
		})
	}

	rankSignals(trades) {
		// TODO Make proper implementation
		// TODO add selectiontype to signature
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
			// TODO Extract to own function when private is available?
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

		const sortedSignalArr = [...signalMap.entries()].sort(([first, x], [second, y]) =>
			new Date(first) < new Date(second) ? -1 : 1
		)

		return new Map(sortedSignalArr)
	}
}

export default Portfolio
