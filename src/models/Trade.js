/* eslint-disable indent */
import _Signal from './Signal'

/**
 * Class to calculate and store data about a particular trade.
 */
class Trade {
	#feeInstance = null // create variable to avoid Jest from throwing

	/**
	 * Creates an instance of a Trade
	 * @param {Object} params
	 * @param {Signal} params.entry the entry signal
	 * @param {Signal} params.exit the exit signal
	 * @param {Stock} params.stock Information about the stock the trade was in. Will be used for UI and aggregation.
	 * @param {Array<Object>} params.tradeData The price action between entry and exit
	 * @param {Number} params.quantity The number of shares
	 * @param {Object} deps
	 * @param {Class} deps.Signal
	 * @todo Add fees
	 */
	constructor({ entry, exit, stock, quantity = 1 }, { Signal = _Signal } = {}) {
		/**
		 * Validates that the input is a Signal instance
		 * @param {Object} s Hopefully a Signal
		 * @returns {Boolean}
		 */
		const isSignal = s => s instanceof Signal

		this.entry = isSignal(entry) ? entry : new Signal(entry)
		this.exit = isSignal(exit) ? exit : new Signal(exit)
		this.stock = stock
		this.quantity = quantity
	}

	get entryPrice() {
		const price = this.entry.price
		return this.#feeInstance
			? price +
					this.calculatePriceWithFees({
						price,
						fee: this.#feeInstance,
						quantity: this.quantity
					})
			: price
	}
	get resultPercent() {
		return this.exitPrice / this.entryPrice - 1
	}

	get resultPerStock() {
		return this.roundNumber(this.exitPrice - this.entryPrice)
	}

	get exitPrice() {
		const price = this.exit.price

		return this.#feeInstance
			? price -
					this.calculatePriceWithFees({
						price,
						fee: this.#feeInstance,
						quantity: this.quantity
					})
			: price
	}

	get totalFees() {
		if (this.#feeInstance) {
			return this.roundNumber(
				this.#feeInstance.calculate(this.entry.price * this.quantity) +
					this.#feeInstance.calculate(this.exit.price * this.quantity)
			)
		}

		return 0
	}

	/**
	 * Returns the performance of the trade in percent while in market.
	 * @returns {Array<Object>} The pricedata between entry and exit in percent
	 * @todo Make _performancePercent private when able to.
	 */
	// get performancePercent() {
	// 	// TODO Make _performancePercent private when able to.
	// 	if (!this._performancePercent) {
	// 		this._performancePercent = this.calculatePerformancePercent({
	// 			entryPrice: this.entryPrice,
	// 			tradeData: this.tradeData
	// 		})
	// 	}
	// 	return this._performancePercent
	// }

	/**
	 * Returns the performance of the trade in $ while in market.
	 * @returns {Array<Object>} The pricedata between entry and exit cash
	 */
	// get performanceCash() {
	// 	// TODO Redo this to fetch data on request
	// 	return this.performancePercent.map(pricePoint => {
	// 		const output = { ...pricePoint }
	// 		output.open = this.roundNumber(this.entryPrice * output.open * this.quantity)
	// 		output.high = this.roundNumber(this.entryPrice * output.high * this.quantity)
	// 		output.low = this.roundNumber(this.entryPrice * output.low * this.quantity)
	// 		output.close = this.roundNumber(this.entryPrice * output.close * this.quantity)

	// 		return output
	// 	})
	// }

	/**
	 * Calculates the initial position value
	 * @returns {number} Initial value
	 */
	get initialValue() {
		return this.roundNumber(this.quantity * this.entryPrice)
	}

	/**
	 * Calculates the final position value
	 * @returns {number} Final value
	 */
	get finalValue() {
		return this.roundNumber(this.quantity * this.exitPrice)
	}

	/**
	 * Calculates the result in cash based on the result per stock multiplied with the quantity.
	 * @returns {number} Result in $$$
	 */
	get resultInCash() {
		return this.roundNumber(this.quantity * this.resultPerStock)
	}

	/**
	 * Set the fee for the trade.
	 * Using method instad of setter to be able to chain.
	 * @param {Fee} fee Instance of Fee
	 * @returns {void}
	 */
	setFee(fee) {
		this.#feeInstance = fee

		return this
	}

	/**
	 * Sets the number of stocks and updates stored values
	 * Using method instad of setter to be able to chain.
	 * @param {Number} quantity The quantity of stocks traded
	 * @returns {Trade} this
	 */
	setQuantity(quantity) {
		this.quantity = quantity

		return this
	}

	/**
	 * Calculates stock price after fees
	 * @param {object} params
	 * @param {number} params.price
	 * @param {number} params.quantity
	 * @param {Fee} params.fee Instance of fee, to calculate the fees
	 * @returns {number} price per stock after fees
	 */
	calculatePriceWithFees({ price, fee, quantity }) {
		return (price + fee.calculate(price * quantity)) / quantity
	}

	calculateQuantity(amount) {
		return Math.floor(amount / this.entry.price) // Using the raw entry price to avoid double fees in the calculation
	}

	// /**
	//  * Calculates the % performance for each bar in market
	//  * @param {Object} params
	//  * @param {Number} params.entryPrice
	//  * @param {Array<Object>} params.tradeData The array of price action between entry and exit
	//  * @returns {Array<Object>} The price action while in market in %
	//  */
	// calculatePerformancePercent({ entryPrice, tradeData }) {
	// 	// TODO Redo this to fetch data on request
	// 	return tradeData.map(pricePoint => {
	// 		const output = { ...pricePoint }

	// 		output.open = (pricePoint.open - entryPrice) / entryPrice
	// 		output.high = (pricePoint.high - entryPrice) / entryPrice
	// 		output.low = (pricePoint.low - entryPrice) / entryPrice
	// 		output.close = (pricePoint.close - entryPrice) / entryPrice

	// 		return output
	// 	})
	// }

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
