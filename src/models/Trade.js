import _Signal from './Signal'

class Trade {
	/**
	 * Creates an instance of a Trade
	 * @param {Object} params
	 * @param {Signal} params.entry the entry signal
	 * @param {Signal} params.exit the exit signal
	 * @param {Array<Object>} params.tradeData The price action between entry and exit
	 * @param {Number} params.quantity The number of shares
	 * @param {Object} deps
	 * @param {Class} deps.Signal
	 * @todo Add fees
	 */
	constructor({ entry, exit, tradeData, quantity = 1 }, { Signal = _Signal } = {}) {
		// TODO Add fee calculation class and inject it here
		const isSignal = s => s instanceof Signal
		const areDatesEqual = (d1, d2) => d1.getTime() !== d2.getTime()

		if (!isSignal(entry) || !isSignal(exit)) {
			throw new Error('Entry and exit must be Signal instances')
		} else if (
			areDatesEqual(entry.date, tradeData[0].date) ||
			areDatesEqual(exit.date, tradeData[tradeData.length - 1].date)
		) {
			throw new Error('Invalid date range')
		}

		this.entry = entry
		this.exit = exit
		this.tradeData = tradeData
		this.quantity = quantity
		this.resultPerStock = this.roundNumber(exit.price - entry.price)
		this.resultPercent = exit.price / entry.price - 1
	}

	/**
	 * Returns the performance of the trade in percent while in market.
	 * @returns {Array<Object>} The pricedata between entry and exit in percent
	 * @todo Make _performancePercent private when able to.
	 */
	get performancePercent() {
		// TODO Make _performancePercent private when able to.
		if (!this._performancePercent) {
			this._performancePercent = this.calculatePerformancePercent({
				entryPrice: this.entry.price,
				tradeData: this.tradeData
			})
		}
		return this._performancePercent
	}

	/**
	 * Returns the performance of the trade in $ while in market.
	 * @returns {Array<Object>} The pricedata between entry and exit cash
	 */
	get performanceCash() {
		return this.performancePercent.map(pricePoint => {
			const output = { ...pricePoint }
			output.open = this.roundNumber(this.entry.price * output.open * this.quantity)
			output.high = this.roundNumber(this.entry.price * output.high * this.quantity)
			output.low = this.roundNumber(this.entry.price * output.low * this.quantity)
			output.close = this.roundNumber(this.entry.price * output.close * this.quantity)

			return output
		})
	}

	/**
	 * Calculates the initial position value
	 * @returns {number} Initial value
	 */
	get initialValue() {
		return this.roundNumber(this.quantity * this.entry.price)
	}

	/**
	 * Calculates the final position value
	 * @returns {number} Final value
	 */
	get finalValue() {
		return this.roundNumber(this.quantity * this.exit.price)
	}

	/**
	 * Calculates the result in cash based on the result per stock multiplied with the quantity.
	 * @returns {number} Result in $$$
	 */
	get resultInCash() {
		return this.roundNumber(this.quantity * this.resultPerStock)
	}

	/**
	 * Calculates the % performance for each bar in market
	 * @param {Object} params
	 * @param {Number} params.entryPrice
	 * @param {Array<Object>} params.tradeData The array of price action between entry and exit
	 * @returns {Array<Object>} The price action while in market in %
	 */
	calculatePerformancePercent({ entryPrice, tradeData }) {
		return tradeData.map(pricePoint => {
			const output = { ...pricePoint }

			output.open = (pricePoint.open - entryPrice) / entryPrice
			output.high = (pricePoint.high - entryPrice) / entryPrice
			output.low = (pricePoint.low - entryPrice) / entryPrice
			output.close = (pricePoint.close - entryPrice) / entryPrice

			return output
		})
	}

	/**
	 * Sets the number of stocks and updates stored values
	 * @param {Number} quantity The quantity of stocks traded
	 * @returns {Trade} this
	 */
	setQuantity(quantity) {
		this.quantity = quantity

		return this
	}

	/**
	 * Converts from the annoying 13-decimal floats.
	 * I'm too poor for this to make a significant error in the end anyways.
	 * @param {Number} num The number to be converted to a proper number
	 * @returns {Number} Rounded to 12 decimals
	 * @todo Make private
	 */
	roundNumber(num) {
		// TODO Make private when able to.
		return Math.round(num * 1e10) / 1e10
	}
}

export default Trade
