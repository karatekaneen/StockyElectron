import Strategy from './Strategy'

export default class Flipper extends Strategy {
	/**
	 * These are the default rules for the strategy. Will probably not be overwritten very often.
	 */
	defaultRules = {
		entryFactor: 6 / 5,
		exitFactor: 5 / 6,
		entryInBearishRegime: false,
		bearishRegimeExitFactor: 11 / 12
	}

	/**
	 * This is the default context that's assigned if none is provided initially.
	 */
	defaultContext = {
		bias: 'neutral',
		highPrice: null,
		lowPrice: null,
		regime: 'bull'
	}

	constructor({ strategyName = 'flipper', initialContext = {}, rules = {} } = {}) {
		super({ strategyName, initialContext })

		this.rules = { ...this.defaultRules, ...rules } // Merge the default rules with the ones given.
		this.context = { ...this.defaultContext, ...initialContext } // Merge default context with the ones provided
	}

	getSignal({ signalBar, currentBar, stock, context }) {
		const newContext = this.setHighLowPrices({
			highPrice: context.highPrice,
			lowPrice: context.lowPrice,
			signalBar
		})
		console.log('pooop')
	}

	/**
	 * Updates the high and low prices to be used as a basis for the signal generation.
	 * @param {Object} params
	 * @param {number|null} params.highPrice the current high to be used for the signaling. Is null by default
	 * @param {number|null} params.lowPrice the current low to be used for the signaling. Is null by default
	 * @param {Object} params.signalBar The bar to check if it triggered any signals
	 * @param {Boolean} params.useHighAndLow If the function should use the bar's high/low or only close value.
	 * @returns {Object} with highPrice
	 */
	setHighLowPrices({ highPrice, lowPrice, signalBar, useHighAndLow = false }) {
		let tempHigh = signalBar.high
		let tempLow = signalBar.low
		const output = {}

		// If useHighAndLow == false we only use the close value.
		if (!useHighAndLow) {
			tempHigh = signalBar.close
			tempLow = signalBar.close
		}

		// If there is no high set, use the first value we get
		if (!highPrice) {
			output.highPrice = tempHigh
		} else {
			// Else use the max of the prev high and the current
			output.highPrice = Math.max(highPrice, tempHigh)
		}

		// If there is no low set, use the current
		if (!lowPrice) {
			output.lowPrice = tempLow
		} else {
			// Set the low to the min of the previous and the current
			output.lowPrice = Math.min(lowPrice, tempLow)
		}

		return output
	}
}
