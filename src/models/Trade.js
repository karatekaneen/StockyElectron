import _Signal from './Signal'

class Trade {
	constructor({ entry, exit, tradeData, quantity = 1 }, { Signal = _Signal } = {}) {
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

		this.setResultInCash()
		this.setPositionValues()
	}

	/**
	 * Returns the performance of the trade in percent while in market.
	 * @returns {Array<Object>} The pricedata between entry and exit in percent
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
		return (this._performanceCash = this.performancePercent.map(pricePoint => {
			const output = { ...pricePoint }
			output.open = this.roundNumber(this.entry.price * output.open * this.quantity)
			output.high = this.roundNumber(this.entry.price * output.high * this.quantity)
			output.low = this.roundNumber(this.entry.price * output.low * this.quantity)
			output.close = this.roundNumber(this.entry.price * output.close * this.quantity)

			return output
		}))
	}

	/**
	 * Sets the initial- and finalValue property to the quantity multiplied with the entry/exit price.
	 * @returns {Trade} this
	 */
	setPositionValues() {
		// ? Should this be a getter instead?
		this.initialValue = this.roundNumber(this.quantity * this.entry.price)
		this.finalValue = this.roundNumber(this.quantity * this.exit.price)

		return this
	}

	/**
	 * Sets the resultInCash property to the quantity multiplied with the result per stock.
	 * @returns {Trade} this
	 */
	setResultInCash() {
		// ? Should this be a getter instead?
		this.resultInCash = this.roundNumber(this.quantity * this.resultPerStock)

		return this
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

		// Update p/l & Update position values
		this.setResultInCash().setPositionValues()

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
