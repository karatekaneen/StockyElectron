import _Trade from './Trade'
import _Fee from './Fee'
import _DataFetcher from '../backendModules/DataFetcher'
import _queue from '../utils/queue'

class Portfolio {
	// these need to be created to avoid Jest from throwing:
	// Trade = null

	// availableSlots = 0 // TODO Make private when able to

	constructor(
		{
			startCapital = 100000,
			maxNumberOfStocks = 20,
			selectionMethod = 'random',
			fee,
			feePercentage = 0.0025,
			feeMinimum = 1
		} = {},
		{ Trade = _Trade, Fee = _Fee, DataFetcher = _DataFetcher, queue = _queue } = {}
	) {
		this.Trade = Trade
		this.DataFetcher = DataFetcher
		this.queue = queue

		this.historicalTrades = []
		this.timeline = new Map()
		this.openTrades = []
		this.signalsNotTaken = 0
		this.startCapital = startCapital
		this.cashAvailable = startCapital
		this.maxNumberOfStocks = maxNumberOfStocks
		this.availableSlots = maxNumberOfStocks
		this.selectionMethod = selectionMethod
		this.fee = fee || new Fee({ percentage: feePercentage, minimum: feeMinimum })
	}

	get openPositions() {
		return this.maxNumberOfStocks - this.availableSlots
	}

	async backtest({ trades, fee = this.fee, Trade = this.Trade }) {
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
					this.availableSlots++
				})

				currentlyHolding.delete(date)
			}

			if (this.availableSlots && entry.length > 0) {
				let signalsTaken = 0
				const tradesToOpen = this.rankSignals(
					entry,
					this.selectionMethod,
					this.availableSlots
				).forEach(t => {
					/*
						t might be pure JSON if it's loaded from db and not directly from the test.
						Then it needs to be instantiated to be able to use the Trade class' methods.
						*/
					const trade = t instanceof Trade ? t : new Trade(t)
					const dateString = trade.exit.date.toISOString()

					const maxPositionValue = this.calculateMaxPositionValue(
						this.cashAvailable,
						fee,
						this.availableSlots
					)

					const quantity = trade.calculateQuantity(maxPositionValue)

					if (quantity > 0) {
						trade.setQuantity(quantity)

						// "Withdraw cash"
						this.cashAvailable -= trade.initialValue

						// Remove slot from availability
						this.availableSlots--
						signalsTaken++

						const existingTrades = currentlyHolding.get(dateString)

						existingTrades
							? currentlyHolding.set(dateString, [...existingTrades, trade])
							: currentlyHolding.set(dateString, [trade])
					}
				})

				this.signalsNotTaken += entry.length - signalsTaken
			}
			this.timeline.set(date, { cashAvailable: this.cashAvailable })
		})

		if (signalMap.size > 0) {
			const firstTrade = signalMap.values().next().value.entry[0] // Get the first entry to know from where to fetch data
			await this.generateTimeline({ firstTrade })
		}

		this.openTrades = currentlyHolding
	}

	/**
	 * Calculates the max amount to spend on a position.
	 * @param {number} cashAvailable The max amount of cash available
	 * @param {Fee} feeInstance Instance of Fee
	 * @param {number} availableSlots Number of open position slots that can be filled
	 * @returns {number} the max amount to buy a single stock for
	 */
	calculateMaxPositionValue(cashAvailable, feeInstance, availableSlots = this.availableSlots) {
		return (cashAvailable - feeInstance.calculate(cashAvailable)) / availableSlots
	}

	/**
	 * Ranks trades according to the selectionMethod.
	 * * Note that Best & Worst should _only_ be used for testing purposes
	 *
	 * @todo Make proper implementation when signals have ranking factors built in.
	 * @param {Array<Trade>} trades The trades to choose from
	 * @param {string} selectionMethod How to pick the trades
	 * @param {number} availableSlots The maximum number of trades to take
	 * @returns {Array<Trade>} The selected trades
	 */
	rankSignals(trades, selectionMethod, availableSlots) {
		if (trades.length <= availableSlots) {
			return trades
		}

		if (selectionMethod === 'random') {
			return [...trades].sort((a, b) => 0.5 - Math.random()).slice(0, availableSlots)
		}

		if (selectionMethod === 'best') {
			const output = [...trades]
				.sort((a, b) => b.resultPercent - a.resultPercent)
				.slice(0, availableSlots)
			return output
		}

		if (selectionMethod === 'worst') {
			return [...trades]
				.sort((a, b) => a.resultPercent - b.resultPercent)
				.slice(0, availableSlots)
		}
		// TODO Make proper implementation
		return trades
	}

	/**
	 * Generates the portfolio history over time and keeping track of the performance, how many stocks were held on each day etc.
	 * @param {object} params
	 * @param {Array<Trade>} params.trades The historical trades from the backtest
	 * @param {Map} params.timeline the existing timeline for the portfolio. Just with cashAvailable set on input
	 * @param {Trade} params.firstTrade The first trade of the backtest. Used for getting the price data from the correct date.
	 * @param {Function} params.queue Helper function to queue work
	 * @param {DataFetcher} params.DataFetcher Class to fetch data
	 * @returns {Map} the portfolio history over time
	 */
	async generateTimeline({
		trades = this.historicalTrades,
		timeline = this.timeline,
		firstTrade,
		queue = this.queue,
		DataFetcher = this.DataFetcher
	}) {
		const dateMap = await this.getDateMap(firstTrade)

		timeline.forEach(({ cashAvailable }, key) => {
			if (cashAvailable) {
				dateMap.set(key, { ...dateMap.get(key), cashAvailable })
			}
		})

		// Generate the cashAvailable for each day:
		let cashAvailable = this.startCapital

		dateMap.forEach((value, key) => {
			if (value.cashAvailable) {
				cashAvailable = value.cashAvailable
			} else {
				value.cashAvailable = cashAvailable
			}

			value.total = cashAvailable
			dateMap.set(key, value)
		}) // TODO Above this should be grouped to another function

		// Group the stocks by id to only have to fetch the data once more.
		const groupedTrades = this.groupTradesByStock(trades)

		const client = new DataFetcher()

		// Loop over the grouped trades and generate tasks (that are functions to be called in the queue)
		const tasks = [...groupedTrades.entries()].map(([id, tradesInStock]) => {
			return async () => {
				// Get the price data
				const { priceData } = await client.fetchStock({
					id,
					fieldString: 'priceData{ date, close }'
				})

				const output = tradesInStock.map(trade => trade.getTradePerformance({ priceData }))

				return output
			}
		}) // TODO This should also be extracted to own function

		const finishedTasks = await queue(tasks, 10)

		let previousValue = null
		finishedTasks.forEach(tradeGroup => {
			tradeGroup.forEach(trade => {
				trade.forEach(({ date, value }) => {
					try {
						const prev = this.checkAndAddValues(date, value, dateMap, previousValue)
						if (prev) {
							previousValue = prev
						}
					} catch (err) {
						console.log(err)
						console.log(trade)
					}
				})
			})
		}) // TODO Extract?

		// TODO Needs to sort the map by the keys since some dates are added out of order.

		this.timeline = dateMap // TODO Fix unnecessary with both return and assignment
		return dateMap
	}

	/**
	 * Adds the data about the trade to the particular date.
	 * @param {Date} date the date to add the data to
	 * @param {number} value The position value on this particular date
	 * @param {Map} dateMap The map to add the data to
	 * @param {object|null} previousValue The previous value to use if none already exist
	 * @returns {object} The data added to this date to be carried into the next.
	 */
	checkAndAddValues(date, value, dateMap, previousValue) {
		const fetchedData = dateMap.get(date.toISOString())
		if (!fetchedData && !previousValue) {
			console.warn('Missing data', { date, value })
			return null
		}

		const existingData = fetchedData || {
			...previousValue,
			totalPositionValue: 0,
			numberOfPositionsOpen: 0,
			total: previousValue.cashAvailable
		}

		// Check if the value exists (it won't for the first day) and then add the value
		existingData.totalPositionValue = existingData.totalPositionValue
			? existingData.totalPositionValue + value
			: value

		// Check and add number of positions
		existingData.numberOfPositionsOpen = existingData.numberOfPositionsOpen
			? existingData.numberOfPositionsOpen + 1
			: 1

		// Total does always exist so no need to check that:
		existingData.total += value

		// Write the new data back to the map
		dateMap.set(date.toISOString(), existingData)
		return existingData
	}

	/**
	 * Groups a bunch of trades based on the stocks's ID.
	 * This allows us to add all the data about the trades in that particular stock
	 * in one go and only need to hit the API one extra time for each stock.
	 *
	 * @param {Array<Trade>} trades The trades to group
	 * @returns {Map} The trades with the stock id as key
	 */
	groupTradesByStock(trades) {
		const stockMap = new Map()

		trades.forEach(trade => {
			const existingTrades = stockMap.get(trade.stock.id)
			existingTrades
				? stockMap.set(trade.stock.id, [...existingTrades, trade])
				: stockMap.set(trade.stock.id, [trade])
		})

		return stockMap
	}

	/**
	 * Generates a map with all the dates since the first trade was taken.
	 * It has empty objects as values.
	 * @param {Trade} firstTrade The first trade taken in the backtest, which is the base for the Map at the moment.
	 * @param {object} deps dependencies
	 * @param {DataFetcher} deps.DataFetcher The DataFetcher class
	 * @returns {Map|null}
	 */
	async getDateMap(firstTrade, { DataFetcher = this.DataFetcher } = {}) {
		// * Using a naïve approach and assuming that the stock that was the first trade hasn't been delisted.
		// TODO Remake this to use an index instead when able to.
		const df = new DataFetcher()

		const stock = await df.fetchStock({
			id: firstTrade.stock.id,
			fieldString: 'priceData{ date }'
		})

		if (!stock) {
			return null
		}

		const kvArray = stock.priceData.map(({ date }) => [date.toISOString(), {}])

		return new Map(kvArray)
	}

	/**
	 * Helper function to map signals to their respective dates.
	 * This is currently making the Map 2x the size from the Trade array,
	 * this maybe should be changed to a reference later.
	 *
	 * @todo Refactor to use reference instead?
	 * @param {Array<Trade>} trades
	 * @param {Trade} Trade The trade class
	 * @returns {Map} The trades grouped by dates
	 */
	generateSignalMaps(trades, Trade = this.Trade) {
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

		trades.forEach(t => {
			const trade = t instanceof Trade ? t : new Trade(t)
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
