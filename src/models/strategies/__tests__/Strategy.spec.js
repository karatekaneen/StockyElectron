import Strategy from '../Strategy'
import Signal from '../../Signal'
jest.mock('../../Signal')

describe('Strategy class', () => {
	it('Has a working constructor', () => {
		const s = new Strategy()

		expect(s instanceof Strategy).toBe(true)
	})

	it('Sets initial context', () => {
		const s = new Strategy({ initialContext: { bias: 'BULL' } })

		expect(s.context).toEqual({ bias: 'BULL' })
	})

	it('Can take a signal function', () => {
		const s = new Strategy({ signalFunction: jest.fn(() => 'woop') })

		expect(s.processBar()).toBe('woop')
	})

	it.todo('Saves test results to avoid running multiple times')

	describe('Test', () => {
		it('Calls to extract the data to be tested', () => {
			const s = new Strategy()
			s.extractData = jest.fn().mockReturnValue([])

			const mockStock = { priceData: ['Array of price data'] }
			const endDate = new Date('1995-12-17T03:24:00').toISOString()

			s.test({ stock: mockStock, endDate })

			expect(s.extractData).toHaveBeenCalledWith({
				priceData: ['Array of price data'],
				startDate: undefined,
				endDate
			})
		})

		it('Checks for signal every bar', () => {
			const s = new Strategy()

			s.handleOpenPositions = jest.fn().mockReturnValue(null)

			s.processBar = jest.fn().mockReturnValue({ signal: null, context: null })

			s.extractData = jest
				.fn()
				.mockReturnValue([{ bar: 'first' }, { bar: 'second' }, { bar: 'third' }])

			const mockStock = { priceData: ['Array of price data'] }
			const endDate = new Date('1995-12-17T03:24:00').toISOString()

			s.test({ stock: mockStock, endDate })

			expect(s.processBar).toHaveBeenCalledTimes(3) // Not calling for the first bar due to lookback but twice on the last to look for pending bars
		})

		it('Updates context every bar', () => {
			const s = new Strategy({ initialContext: null })

			s.handleOpenPositions = jest.fn().mockReturnValue(null)

			s.processBar = jest
				.fn()
				.mockReturnValueOnce({ signal: null, context: { call: 'first' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'second' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'third' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'fourth' } })

			s.extractData = jest
				.fn()
				.mockReturnValue([
					{ bar: 'first' },
					{ bar: 'second' },
					{ bar: 'third' },
					{ bar: 'fourth' }
				])

			const mockStock = { priceData: ['Array of price data'] }
			const endDate = new Date('1995-12-17T03:24:00').toISOString()

			s.test({ stock: mockStock, endDate })

			expect(s.processBar.mock.calls[0][0].context).toBe(null)
			expect(s.processBar.mock.calls[1][0].context).toEqual({ call: 'first' })
			expect(s.processBar.mock.calls[2][0].context).toEqual({ call: 'second' })
			expect(s.processBar.mock.calls[3][0].context).toEqual({ call: 'third' })
		})

		it('Checks for pending signals on last bar', () => {
			const s = new Strategy({ initialContext: null })

			s.handleOpenPositions = jest.fn().mockReturnValue(null)

			s.processBar = jest
				.fn()
				.mockReturnValueOnce({ signal: null, context: { call: 'first' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'second' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'third' } })
				.mockReturnValueOnce({
					signal: { name: 'buy everything' },
					context: { call: 'fourth' }
				})

			s.extractData = jest.fn(({ priceData }) => priceData)

			const mockStock = {
				priceData: [
					{ open: 25, high: 32, low: 29, close: 15 },
					{ open: 32, high: 534, low: 64, close: 4 },
					{ open: 53, high: 53, low: 54, close: 2 },
					{ open: 43, high: 65, low: 76, close: 34 }
				]
			}

			const { pendingSignal } = s.test({ stock: mockStock })

			expect(s.processBar).toHaveBeenCalledTimes(mockStock.priceData.length) // Skips the first bar but two times on the last
			expect(s.processBar.mock.calls[3][0].currentBar).toEqual({
				close: null,
				date: null,
				high: null,
				low: null,
				open: null
			})

			expect(pendingSignal).toEqual({ name: 'buy everything' })
		})

		it('Returns historical context', () => {
			const s = new Strategy({ initialContext: null })

			s.handleOpenPositions = jest.fn().mockReturnValue(null)

			s.processBar = jest
				.fn()
				.mockReturnValueOnce({ signal: null, context: { call: 'first' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'second' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'third' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'fourth' } })

			s.extractData = jest
				.fn()
				.mockReturnValue([
					{ bar: 'first' },
					{ bar: 'second' },
					{ bar: 'third' },
					{ bar: 'fourth' }
				])

			const mockStock = { priceData: ['Array of price data'] }
			const endDate = new Date('1995-12-17T03:24:00').toISOString()

			const { contextHistory } = s.test({ stock: mockStock, endDate })
			expect(contextHistory).toEqual([
				null, // Initial context
				{ call: 'first' },
				{ call: 'second' },
				{ call: 'third' }
			])
		})

		it('Does not add null signals', () => {
			const s = new Strategy({ initialContext: null })

			s.handleOpenPositions = jest.fn().mockReturnValue(null)

			s.processBar = jest
				.fn()
				.mockReturnValueOnce({ signal: null, context: { call: 'first' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'second' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'third' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'fourth' } })

			s.extractData = jest
				.fn()
				.mockReturnValue([
					{ bar: 'first' },
					{ bar: 'second' },
					{ bar: 'third' },
					{ bar: 'fourth' }
				])

			const mockStock = { priceData: ['Array of price data'] }
			const endDate = new Date('1995-12-17T03:24:00').toISOString()

			const { signals } = s.test({ stock: mockStock, endDate })
			expect(signals).toEqual([])
		})

		it('Adds signals to array', () => {
			const s = new Strategy({ initialContext: null })

			s.processBar = jest
				.fn()
				.mockReturnValueOnce({ signal: null, context: { call: 'first' } })
				.mockReturnValueOnce({ signal: { type: 'Enter' }, context: { call: 'second' } })
				.mockReturnValueOnce({ signal: { type: 'Exit' }, context: { call: 'third' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'fourth' } })

			s.extractData = jest
				.fn()
				.mockReturnValue([
					{ bar: 'first' },
					{ bar: 'second' },
					{ bar: 'third' },
					{ bar: 'fourth' }
				])

			const mockStock = { priceData: ['Array of price data'] }
			const endDate = new Date('1995-12-17T03:24:00').toISOString()

			const { signals } = s.test({ stock: mockStock, endDate })
			expect(signals).toEqual([{ type: 'Enter' }, { type: 'Exit' }])
		})

		it('calls to handle open positions', () => {
			const s = new Strategy({ initialContext: null })
			s.handleOpenPositions = jest.fn().mockReturnValue(null)
			s.processBar = jest
				.fn()
				.mockReturnValueOnce({ signal: null, context: { call: 'first' } })
				.mockReturnValueOnce({ signal: { type: 'Enter' }, context: { call: 'second' } })
				.mockReturnValueOnce({ signal: { type: 'Exit' }, context: { call: 'third' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'fourth' } })

			s.extractData = jest
				.fn()
				.mockReturnValue([
					{ bar: 'first' },
					{ bar: 'second' },
					{ bar: 'third' },
					{ bar: 'fourth' }
				])

			const mockStock = { priceData: ['Array of price data'] }
			const endDate = new Date('1995-12-17T03:24:00').toISOString()

			s.test({ stock: mockStock, endDate })

			expect(s.handleOpenPositions).toHaveBeenCalledTimes(1)
			expect(s.handleOpenPositions.mock.calls[0][0]).toEqual({
				context: { call: 'third' },
				currentBar: { bar: 'fourth' },
				signals: [{ type: 'Enter' }, { type: 'Exit' }],
				stock: {}
			})
		})

		it.todo('Adds information about open trade')

		it.todo('Checks for identical tests before running')
	})

	describe('Handle open positions', () => {
		it('Generates exit signal for open position if signal array length is odd and last signal is to enter', () => {
			const s = new Strategy({ initialContext: null })

			const openPositionPolicy = 'conservative'
			const signals = [{ type: 'enter' }]
			const stock = { name: 'SKF AB' }
			const currentBar = {
				date: new Date('2019-12-13'),
				open: 25,
				high: 29,
				low: 21,
				close: 25
			}
			const context = { triggerPrice: 20 }

			const resp = s.handleOpenPositions({
				signals,
				context,
				currentBar,
				stock,
				openPositionPolicy
			})

			expect(resp instanceof Signal).toBe(true)
		})

		it('Throws if signals length is odd and last signal is to exit', () => {
			expect.assertions(1)

			const s = new Strategy({ initialContext: null })

			const openPositionPolicy = 'conservative'
			const signals = [{ type: 'exit' }]
			const stock = { name: 'SKF AB' }
			const currentBar = {
				date: new Date('2019-12-13'),
				open: 25,
				high: 29,
				low: 21,
				close: 25
			}
			const context = { triggerPrice: 20 }

			try {
				const resp = s.handleOpenPositions({
					signals,
					context,
					currentBar,
					stock,
					openPositionPolicy
				})
			} catch (err) {
				expect(err.message).toBe(
					'Logic error found. Uneven length on signal array and last signal was to exit'
				)
			}
		})

		it('Returns null if no open position detected', () => {
			const s = new Strategy({ initialContext: null })

			const openPositionPolicy = 'conservative'
			const signals = [{ type: 'enter' }, { type: 'exit' }]
			const stock = { name: 'SKF AB' }
			const currentBar = {
				date: new Date('2019-12-13'),
				open: 25,
				high: 29,
				low: 21,
				close: 25
			}
			const context = { triggerPrice: 20 }

			const resp = s.handleOpenPositions({
				signals,
				context,
				currentBar,
				stock,
				openPositionPolicy
			})

			expect(resp).toBe(null)
		})

		it('Generates signal based on trigger price if openPositionPolicy is "conservative"', () => {
			const s = new Strategy({ initialContext: null })

			const openPositionPolicy = 'conservative'
			const signals = [{ type: 'enter' }]
			const stock = { name: 'SKF AB' }
			const currentBar = {
				date: new Date('2019-12-13'),
				open: 25,
				high: 29,
				low: 21,
				close: 25
			}
			const context = { triggerPrice: 20 }

			const resp = s.handleOpenPositions({
				signals,
				context,
				currentBar,
				stock,
				openPositionPolicy
			})

			expect(resp instanceof Signal).toBe(true)
			expect(Signal).toHaveBeenCalledWith({
				action: 'sell',
				date: new Date('2019-12-13T00:00:00.000Z'),
				price: 20,
				stock,
				type: 'exit'
			})
		})

		it('Generates signal based on trigger price if openPositionPolicy is "exclude"', () => {
			const s = new Strategy({ initialContext: null })

			const openPositionPolicy = 'exclude'
			const signals = [{ type: 'enter' }]
			const stock = { name: 'SKF AB' }
			const currentBar = {
				date: new Date('2019-12-13'),
				open: 25,
				high: 29,
				low: 21,
				close: 25
			}
			const context = { triggerPrice: 20 }

			const resp = s.handleOpenPositions({
				signals,
				context,
				currentBar,
				stock,
				openPositionPolicy
			})

			expect(resp instanceof Signal).toBe(true)
			expect(Signal).toHaveBeenCalledWith({
				action: 'sell',
				date: new Date('2019-12-13T00:00:00.000Z'),
				price: 20,
				stock,
				type: 'exit'
			})
		})

		it('Generates signal based on current price if openPositionPolicy is "optimistic"', () => {
			const s = new Strategy({ initialContext: null })

			const openPositionPolicy = 'optimistic'
			const signals = [{ type: 'enter' }]
			const stock = { name: 'SKF AB' }
			const currentBar = {
				date: new Date('2019-12-13'),
				open: 25,
				high: 29,
				low: 21,
				close: 25
			}
			const context = { triggerPrice: 20 }

			const resp = s.handleOpenPositions({
				signals,
				context,
				currentBar,
				stock,
				openPositionPolicy
			})

			expect(resp instanceof Signal).toBe(true)
			expect(Signal).toHaveBeenCalledWith({
				action: 'sell',
				date: new Date('2019-12-13T00:00:00.000Z'),
				price: 25,
				stock,
				type: 'exit'
			})
		})
	})

	describe('Summarize Signals', () => {
		it('Throws if array length is uneven and there is no signal for open positions', () => {
			expect.assertions(1)

			const s = new Strategy({ initialContext: null })
			const signals = [{ type: 'enter' }, { type: 'exit' }, { type: 'enter' }]

			try {
				s.summarizeSignals({ signals, priceData: [], closeOpenPosition: null })
			} catch (err) {
				expect(err.message).toBe('No exit signal for open position provided')
			}
		})

		it('Throws if the last signal is to enter', () => {
			expect.assertions(1)

			const s = new Strategy({ initialContext: null })
			const signals = [{ type: 'enter' }, { type: 'enter' }]

			try {
				s.summarizeSignals({ signals, priceData: [], closeOpenPosition: null })
			} catch (err) {
				expect(err.message).toBe('No exit signal for open position provided')
			}
		})

		it.todo('Groups entry & exit signals')
		it.todo('Calls to extract the price data between entry and exit')
		it.todo('Excludes last trade if openPostionPolicy is "exclude"')
		it.todo('Creates Trade instance with entry, exit and pricedata')
		it.todo('Return array of Trades')
	})

	describe('Group signals', () => {
		it('Groups signals in arrays of 2', () => {
			const s = new Strategy({ initialContext: null })
			const signals = [{ type: 'enter' }, { type: 'exit' }, { type: 'enter' }, { type: 'exit' }]

			expect(s.groupSignals(signals)).toEqual([
				[{ type: 'enter' }, { type: 'exit' }],
				[{ type: 'enter' }, { type: 'exit' }]
			])
		})

		it('Validates that each signal group has both entry and exit', () => {
			const s = new Strategy({ initialContext: null })
			const signals = [{ type: 'enter' }, { type: 'exit' }, { type: 'enter' }, { type: 'enter' }]

			try {
				expect(s.groupSignals(signals))
			} catch (err) {
				expect(err.message).toBe('Invalid sequence or number of signals')
			}
		})

		it('Validates that each signal group is actually a group', () => {
			const s = new Strategy({ initialContext: null })
			const signals = [{ type: 'enter' }, { type: 'exit' }, { type: 'enter' }]

			try {
				expect(s.groupSignals(signals))
			} catch (err) {
				expect(err.message).toBe('Invalid sequence or number of signals')
			}
		})
	})
})
