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

	constructor({ strategyName = 'flipper', initialContext = {}, rules = {} } = {}) {
		super({ strategyName, initialContext })

		this.rules = { ...this.defaultRules, ...rules } // Merge the default rules with the ones given.
		console.info('Flipper instance created')
	}

	getSignal() {
		console.log('pooop')
	}
}
