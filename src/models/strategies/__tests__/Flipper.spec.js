import Flipper from '../Flipper'
import Signal from '../../Signal'
jest.mock('../../Signal')

beforeEach(() => {
	Signal.mockClear()
})

describe('Flipper Strategy', () => {
	it('Has a working constructor', () => {
		const f = new Flipper()
		expect(f instanceof Flipper).toBe(true)
	})

	it('Uses default rules if none provided', () => {
		const f = new Flipper()

		expect(f.rules.entryFactor).toBe(1.2)
		expect(f.rules.entryInBearishRegime).toBe(false)
	})

	it('Can override single rule in constructor', () => {
		const f = new Flipper({ rules: { entryFactor: 1 } })

		expect(f.rules.entryFactor).toBe(1)
		expect(f.rules.entryInBearishRegime).toBe(false)
	})

	it('Uses default context if none is provided', () => {
		const f = new Flipper()

		expect(f.context.bias).toBe('neutral')
		expect(f.context.regime).toBe('bull')
	})

	it('Can overwrite single context property in constructor', () => {
		const f = new Flipper({ initialContext: { bias: 'bull' } })

		expect(f.context.bias).toBe('bull')
		expect(f.context.regime).toBe('bull')
	})

	describe('Process Bar', () => {
		it('Calls to update high & low prices', () => {
			const f = new Flipper()
			f.setHighLowPrices = jest.fn().mockReturnValue({ highPrice: 200, lowPrice: 100 })
			f.updateRegime = jest.fn().mockReturnValue('bull')
			f.checkForTrigger = jest.fn().mockReturnValue({ signal: null, bias: 'bull' })

			const resp = f.processBar({
				signalBar: { a: 'this is my signal' },
				currentBar: { b: 'this is my current bar' },
				stock: { name: 'STONK' },
				context: { highPrice: 2, lowPrice: 1 }
			})

			expect(f.setHighLowPrices).toHaveBeenCalledWith({
				highPrice: 2,
				lowPrice: 1,
				signalBar: { a: 'this is my signal' }
			})
		})

		it('Calls to update regime', () => {
			const f = new Flipper()
			f.setHighLowPrices = jest.fn().mockReturnValue({ highPrice: 200, lowPrice: 100 })
			f.updateRegime = jest.fn().mockReturnValue('bull')
			f.checkForTrigger = jest.fn().mockReturnValue({ signal: null, bias: 'bull' })

			const resp = f.processBar({
				signalBar: { a: 'this is my signal' },
				currentBar: { b: 'this is my current bar' },
				stock: { name: 'STONK' },
				context: { highPrice: 2, lowPrice: 1 }
			})

			expect(f.updateRegime).toHaveBeenCalled()
		})

		it('Checks if signal should be sent', () => {
			const f = new Flipper()
			f.setHighLowPrices = jest.fn().mockReturnValue({ highPrice: 200, lowPrice: 100 })
			f.updateRegime = jest.fn().mockReturnValue('bull')
			f.checkForTrigger = jest.fn().mockReturnValue({ signal: null, bias: 'bull' })

			const resp = f.processBar({
				signalBar: { a: 'this is my signal' },
				currentBar: { b: 'this is my current bar' },
				stock: { name: 'STONK' },
				context: { highPrice: 2, lowPrice: 1, bias: 'bear' }
			})

			expect(f.checkForTrigger).toHaveBeenCalledWith({
				currentBar: { b: 'this is my current bar' },
				currentBias: 'bear',
				highPrice: 200,
				lowPrice: 100,
				signalBar: { a: 'this is my signal' },
				stock: { name: 'STONK' }
			})
		})

		it('Returns bias from checkForTrigger', () => {
			const f = new Flipper()
			f.setHighLowPrices = jest.fn().mockReturnValue({ highPrice: 200, lowPrice: 100 })
			f.updateRegime = jest.fn().mockReturnValue('bull')
			f.checkForTrigger = jest.fn().mockReturnValue({ signal: null, context: { bias: 'bull' } })

			const resp = f.processBar({
				signalBar: { a: 'this is my signal' },
				currentBar: { b: 'this is my current bar' },
				stock: { name: 'STONK' },
				context: { highPrice: 2, lowPrice: 1, bias: 'bear' }
			})

			expect(resp.context.bias).toBe('bull')
		})

		it('Adds new triggerPrice to context', () => {
			const f = new Flipper()
			f.setHighLowPrices = jest.fn().mockReturnValue({ highPrice: 200, lowPrice: 100 })
			f.updateRegime = jest.fn().mockReturnValue('bull')
			f.checkForTrigger = jest
				.fn()
				.mockReturnValue({ signal: null, context: { bias: 'bull', triggerPrice: 11000000 } })

			const resp = f.processBar({
				signalBar: { a: 'this is my signal' },
				currentBar: { b: 'this is my current bar' },
				stock: { name: 'STONK' },
				context: { highPrice: 2, lowPrice: 1, bias: 'bear', triggerPrice: 25 }
			})

			expect(resp.context.triggerPrice).toBe(11000000)
		})

		it('Returns updated context', () => {
			const f = new Flipper()
			f.setHighLowPrices = jest.fn().mockReturnValue({ highPrice: 200, lowPrice: 100 })
			f.updateRegime = jest.fn().mockReturnValue('bull')
			f.checkForTrigger = jest.fn().mockReturnValue({ signal: null, context: { bias: 'bull' } })

			const resp = f.processBar({
				signalBar: { a: 'this is my signal' },
				currentBar: { b: 'this is my current bar' },
				stock: { name: 'STONK' },
				context: { highPrice: 2, lowPrice: 1, bias: 'bear' }
			})

			expect(resp.context).toEqual({
				bias: 'bull',
				highPrice: 200,
				lowPrice: 100,
				regime: 'bull'
			})
		})

		it('Returns signal as null if none is triggered', () => {
			const f = new Flipper()
			f.setHighLowPrices = jest.fn().mockReturnValue({ highPrice: 200, lowPrice: 100 })
			f.updateRegime = jest.fn().mockReturnValue('bull')
			f.checkForTrigger = jest.fn().mockReturnValue({ signal: null, bias: 'bull' })

			const resp = f.processBar({
				signalBar: { a: 'this is my signal' },
				currentBar: { b: 'this is my current bar' },
				stock: { name: 'STONK' },
				context: { highPrice: 2, lowPrice: 1, bias: 'bear' }
			})

			expect(resp.signal).toBe(null)
		})

		it('Returns signal if it should', () => {
			const f = new Flipper()
			f.setHighLowPrices = jest.fn().mockReturnValue({ highPrice: 200, lowPrice: 100 })
			f.updateRegime = jest.fn().mockReturnValue('bull')
			f.checkForTrigger = jest
				.fn()
				.mockReturnValue({ signal: { type: 'BUY EVERYTHING' }, bias: 'bull' })

			const resp = f.processBar({
				signalBar: { a: 'this is my signal' },
				currentBar: { b: 'this is my current bar' },
				stock: { name: 'STONK' },
				context: { highPrice: 2, lowPrice: 1, bias: 'bear' }
			})

			expect(resp.signal.type).toBe('BUY EVERYTHING')
		})

		it.todo(
			'Can create a "pending signal" on the last bar before the next one has opened. Useful for live trading.'
		)

		it.todo('can update high/low price based on the triggering')
	})

	describe('Set high / low prices', () => {
		it('Updates high if current close is higher than highPrice && not using high', () => {
			const f = new Flipper()

			const signalBar = {
				open: 100,
				high: 200,
				low: 100,
				close: 110
			}
			const resp = f.setHighLowPrices({ highPrice: 100, lowPrice: 90, signalBar })

			expect(resp).toEqual({ highPrice: 110, lowPrice: 90 })
		})

		it('Does not update highPrice if current is lower', () => {
			const f = new Flipper()

			const signalBar = {
				open: 100,
				high: 200,
				low: 100,
				close: 110
			}
			const resp = f.setHighLowPrices({ highPrice: 120, lowPrice: 90, signalBar })

			expect(resp).toEqual({ highPrice: 120, lowPrice: 90 })
		})

		it('Updates high if current high is higher than highPrice && using high', () => {
			const f = new Flipper()

			const signalBar = {
				open: 100,
				high: 200,
				low: 100,
				close: 110
			}
			const resp = f.setHighLowPrices({
				highPrice: 100,
				lowPrice: 90,
				signalBar,
				useHighAndLow: true
			})

			expect(resp).toEqual({ highPrice: 200, lowPrice: 90 })
		})

		it('Sets the highPrice to current close if highPrice is null && not using high', () => {
			const f = new Flipper()

			const signalBar = {
				open: 100,
				high: 200,
				low: 100,
				close: 123
			}
			const resp = f.setHighLowPrices({ highPrice: null, lowPrice: 90, signalBar })

			expect(resp).toEqual({ highPrice: 123, lowPrice: 90 })
		})

		it('Sets the highPrice to current close if highPrice is null && not using high', () => {
			const f = new Flipper()

			const signalBar = {
				open: 100,
				high: 200,
				low: 100,
				close: 123
			}
			const resp = f.setHighLowPrices({
				highPrice: null,
				lowPrice: 90,
				signalBar,
				useHighAndLow: true
			})

			expect(resp).toEqual({ highPrice: 200, lowPrice: 90 })
		})

		// Low
		it('Updates low if current close is lower than lowPrice && not using low', () => {
			const f = new Flipper()

			const signalBar = {
				open: 100,
				high: 100,
				low: 100,
				close: 80
			}
			const resp = f.setHighLowPrices({ highPrice: 100, lowPrice: 90, signalBar })

			expect(resp).toEqual({ highPrice: 100, lowPrice: 80 })
		})

		it('Does not update lowPrice if current is higher', () => {
			const f = new Flipper()

			const signalBar = {
				open: 100,
				high: 100,
				low: 100,
				close: 100
			}
			const resp = f.setHighLowPrices({ highPrice: 100, lowPrice: 90, signalBar })

			expect(resp).toEqual({ highPrice: 100, lowPrice: 90 })
		})

		it('Updates low if current low is lower than lowPrice && using low', () => {
			const f = new Flipper()

			const signalBar = {
				open: 100,
				high: 100,
				low: 70,
				close: 80
			}
			const resp = f.setHighLowPrices({
				highPrice: 100,
				lowPrice: 90,
				signalBar,
				useHighAndLow: true
			})

			expect(resp).toEqual({ highPrice: 100, lowPrice: 70 })
		})

		it('Sets the lowPrice to current close if lowPrice is null && not using low', () => {
			const f = new Flipper()

			const signalBar = {
				open: 100,
				high: 100,
				low: 100,
				close: 90
			}
			const resp = f.setHighLowPrices({ highPrice: 100, lowPrice: null, signalBar })

			expect(resp).toEqual({ highPrice: 100, lowPrice: 90 })
		})

		it('Sets the lowPrice to current close if lowPrice is null && not using low', () => {
			const f = new Flipper()

			const signalBar = {
				open: 100,
				high: 100,
				low: 70,
				close: 80
			}
			const resp = f.setHighLowPrices({
				highPrice: 100,
				lowPrice: null,
				signalBar,
				useHighAndLow: true
			})

			expect(resp).toEqual({ highPrice: 100, lowPrice: 70 })
		})
	})

	describe('check for trigger', () => {
		it.todo('Should be able to generate pending signals for live trading')

		describe('Bear/Neutral initial bias', () => {
			it('Sets bias to bull if long entry triggered when bias is bearish', () => {
				const f = new Flipper()

				const { context } = f.checkForTrigger({
					highPrice: 200,
					lowPrice: 100,
					currentBias: 'bear',
					signalBar: { close: 120 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(context.bias).toBe('bull')
			})

			it('Does not change bias from bear to bull without trigger', () => {
				const f = new Flipper()

				const { context } = f.checkForTrigger({
					highPrice: 200,
					lowPrice: 100,
					currentBias: 'bear',
					signalBar: { close: 119.9999 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(context.bias).toBe('bear')
			})

			it('Sets bias to bull if long entry triggered when bias is neutral', () => {
				const f = new Flipper()

				const { context } = f.checkForTrigger({
					highPrice: 200,
					lowPrice: 100,
					currentBias: 'bear',
					signalBar: { close: 120 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(context.bias).toBe('bull')
			})

			it('Resets high price when getting long entry trigger', () => {
				const f = new Flipper()

				const { context } = f.checkForTrigger({
					highPrice: 200,
					lowPrice: 100,
					currentBias: 'bear',
					signalBar: { close: 120 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(context.highPrice).toBe(120)
			})

			it('Sets triggerPrice to stop-loss level when getting long entry trigger', () => {
				const f = new Flipper()

				const { context } = f.checkForTrigger({
					highPrice: 200,
					lowPrice: 100,
					currentBias: 'bear',
					signalBar: { close: 120 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(context.triggerPrice).toBe(100)
			})

			it('Generates Signal instance if long entry trigger', () => {
				const f = new Flipper()

				f.checkForTrigger({
					highPrice: 200,
					lowPrice: 100,
					currentBias: 'bear',
					signalBar: { close: 120 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(Signal).toHaveBeenCalledTimes(1)
			})

			it('Creates Signal instance with the data from the day after', () => {
				const f = new Flipper()

				f.checkForTrigger({
					highPrice: 200,
					lowPrice: 100,
					currentBias: 'bear',
					signalBar: { close: 120, open: 100, date: new Date('2019-12-12') },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13'),
						close: 200
					}
				})

				const { date, price } = Signal.mock.calls[0][0]
				expect(date).toEqual(new Date('2019-12-13'))
				expect(price).toBe(125)
			})

			it('returns Signal instance if created', () => {
				const f = new Flipper()

				const { signal } = f.checkForTrigger({
					highPrice: 200,
					lowPrice: 100,
					currentBias: 'bear',
					signalBar: { close: 120 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(signal instanceof Signal).toBe(true)
			})

			it('sets triggerPrice even if no long entry signal is triggered', () => {
				const f = new Flipper()

				const { context } = f.checkForTrigger({
					highPrice: 200,
					lowPrice: 100,
					currentBias: 'bear',
					signalBar: { close: 108 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(context.triggerPrice).toBe(120)
			})

			it.todo('Should check regime before entering')
		})

		describe('Bull initial bias', () => {
			it('Sets bias to bear if long exit triggered when bias is bullish', () => {
				const f = new Flipper()

				const { context } = f.checkForTrigger({
					highPrice: 100,
					lowPrice: 50,
					currentBias: 'bull',
					signalBar: { close: 80 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(context.bias).toBe('bear')
			})

			it('Does not change bias from bear to bull without trigger', () => {
				const f = new Flipper()

				const { context } = f.checkForTrigger({
					highPrice: 120,
					lowPrice: 50,
					currentBias: 'bull',
					signalBar: { close: 100.1 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(context.bias).toBe('bull')
			})

			it('Resets low price when getting long exit trigger', () => {
				const f = new Flipper()

				const { context } = f.checkForTrigger({
					highPrice: 120,
					lowPrice: 100,
					currentBias: 'bull',
					signalBar: { close: 99 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(context.lowPrice).toBe(99)
			})

			it('Sets triggerPrice to entry level when getting long exit trigger', () => {
				const f = new Flipper()

				const { context } = f.checkForTrigger({
					highPrice: 120,
					lowPrice: 100,
					currentBias: 'bull',
					signalBar: { close: 99 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(context.triggerPrice).toBe(118.8)
			})

			it('Generates Signal instance if long exit trigger', () => {
				const f = new Flipper()

				f.checkForTrigger({
					highPrice: 120,
					lowPrice: 99,
					currentBias: 'bull',
					signalBar: { close: 99 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(Signal).toHaveBeenCalledTimes(1)
			})

			it('Creates Signal instance with the data from the day after', () => {
				const f = new Flipper()

				f.checkForTrigger({
					highPrice: 120,
					lowPrice: 99,
					currentBias: 'bull',
					signalBar: { close: 99, open: 100, date: new Date('2019-12-12') },
					triggerPrice: null,
					currentBar: {
						open: 101,
						date: new Date('2019-12-13'),
						close: 200
					}
				})

				const { date, price } = Signal.mock.calls[0][0]
				expect(date).toEqual(new Date('2019-12-13'))
				expect(price).toBe(101)
			})

			it('returns Signal instance if created', () => {
				const f = new Flipper()

				const { signal } = f.checkForTrigger({
					highPrice: 120,
					lowPrice: 100,
					currentBias: 'bull',
					signalBar: { close: 99 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(signal instanceof Signal).toBe(true)
			})

			it('sets triggerPrice even if no long entry signal is triggered', () => {
				const f = new Flipper()

				const { context } = f.checkForTrigger({
					highPrice: 120,
					lowPrice: 50,
					currentBias: 'bull',
					signalBar: { close: 108 },
					triggerPrice: null,
					currentBar: {
						open: 125,
						date: new Date('2019-12-13')
					}
				})

				expect(context.triggerPrice).toBe(100)
			})

			it.todo('Should check regime before deciding what exitfactor to use')
		})
	})

	describe('Regime filtering', () => {
		it.todo('Can take a separate dataset as regime filter')
		it.todo('Moves exit signal to 1/12 if bearish regime')
		it.todo('Does not enter if bearish regime')
	})
})
