import Flipper from '../Flipper'

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

	describe('Get Signal', () => {
		it.todo('Calls to update high & low prices')
		it.todo('Calls to update regime')
		it.todo('Checks if signal should be sent')
		it.todo('Updates bias if signal is sent')
		it.todo('Returns signal if it should, else null')
		it.todo('Returns updated context')
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

	describe('Context', () => {
		it.todo('Moves down lowest price on new low if bearish/neutral bias')
		it.todo('Moves up highest price on new high if bullish bias')
	})

	describe('Signaling', () => {
		it.todo('Generates entry signal if price has risen 1/5 from low and bearish bias')
		it.todo('Generates exit signal if price falls 1/6 from high and bullish bias')
	})

	describe('Regime filtering', () => {
		it.todo('Can take a separate dataset as regime filter')
		it.todo('Moves exit signal to 1/12 if bearish regime')
		it.todo('Does not enter if bearish regime')
	})
})
