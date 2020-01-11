import Strategy from './Strategy'

export default class Flipper extends Strategy {
	constructor({ strategyName = 'flipper', initialContext = {}, rules = {} } = {}) {
		super({ strategyName, initialContext })
		this.rules = rules
		console.info('Flipper instance created')
	}

	getSignal() {
		console.log('pooop')
	}
}
