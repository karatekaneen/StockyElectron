import Strategy from './Strategy'

/**
 * "20% Flipper" by Nick Radge.
 * Has the default rules added but can be overwritten in the constructor.
 * Basically the strategy is to buy a stock if it rises 20% from a bottom and sell if it
 * falls 20% (or 5/6) from a top when long.
 * @extends Strategy
 */
class Flipper extends Strategy {
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

	/**
	 * Creates an instance of the Flipper Strategy.
	 * @param {Object} params
	 * @param {String} params.strategyName The name of the strategy
	 * @param {Object} params.initialContext The initial context to start with. Useful to set inital bias etc.
	 * @param {Object} params.rules the rules for the strategy. See `defaultRules` for the ones that are available.
	 * @returns {Flipper}
	 */
	constructor({ strategyName = 'flipper', initialContext = {}, rules = {} } = {}) {
		super({ strategyName, initialContext })

		this.rules = { ...this.defaultRules, ...rules } // Merge the default rules with the ones given.
		this.context = { ...this.defaultContext, ...initialContext } // Merge default context with the ones provided
	}

	/**
	 * This is the function that's being called for every bar and updates context and checks for triggers.
	 * @param {Object} params
	 * @param {Object} params.signalBar "yesterdays" bar to check for signal to avoid look-ahead-bias.
	 * @param {Object} params.currentBar "today" Will be used to give date and price (open) for entry/exit.
	 * @param {Stock} params.stock The stock being tested. Should be the summary of the stock and not with the whole priceData array to keep size down.
	 * @param {Object} params.context The context that's being carried between bars to keep the test's state.
	 * @returns {Object} with `signal` (null if no signal is found, else Signal) and `context` to be carried to the next bar.
	 */
	processBar({ signalBar, currentBar, stock, context }) {
		// Update the context with the latest highs and lows
		const newContext = this.setHighLowPrices({
			highPrice: context.highPrice,
			lowPrice: context.lowPrice,
			signalBar
		})

		// Check the regime filter
		newContext.regime = this.updateRegime()

		// Check if the signalbar triggered anything. Will be null if no signal is given which is ok to return as it is
		const { signal, bias } = this.checkForTrigger({
			highPrice: newContext.highPrice,
			lowPrice: newContext.lowPrice,
			currentBias: context.bias,
			signalBar,
			currentBar,
			stock
		})

		// Assign the latest bias
		newContext.bias = bias

		return { signal, context: newContext }
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

	updateRegime() {
		return 'bull'
	}

	checkForTrigger({ highPrice, lowPrice, currentBias, signalBar, currentBar, stock }) {
		return { signal: null, bias: 'bull' }
	}
}

export default Flipper
