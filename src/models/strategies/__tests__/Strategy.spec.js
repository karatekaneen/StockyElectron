import Strategy from '../Strategy'
import Signal from '../../Signal'
import Trade from '../../Trade'
jest.mock('../../Signal')
jest.mock('../../Trade')

beforeEach(() => {
	jest.clearAllMocks()
})

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

	describe('Test', () => {
		it('Calls to extract the data to be tested', () => {
			const s = new Strategy()
			s.extractData = jest.fn().mockReturnValue({ startIndex: 0, endIndex: 6 })

			const mockStock = { priceData: ['Array of price data'] }
			const endDate = new Date('1995-12-17T03:24:00').toISOString()

			s.test({ stock: mockStock, endDate })

			expect(s.extractData).toHaveBeenCalledWith({
				priceData: ['Array of price data'],
				startDate: null,
				endDate
			})
		})

		it('Checks for signal every bar', () => {
			const s = new Strategy()

			s.handleOpenPositions = jest.fn().mockReturnValue(null)

			s.processBar = jest.fn().mockReturnValue({ signal: null, context: null })

			s.extractData = jest.fn().mockReturnValue({ startIndex: 0, endIndex: 2 })

			const mockStock = {
				priceData: [{ bar: 'first' }, { bar: 'second' }, { bar: 'third' }, { bar: 'fourth' }]
			}
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

			s.extractData = jest.fn().mockReturnValue({ startIndex: 0, endIndex: 3 })

			const mockStock = {
				priceData: [{ bar: 'first' }, { bar: 'second' }, { bar: 'third' }, { bar: 'fourth' }]
			}
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

			const mockStock = {
				priceData: [
					{ open: 25, high: 32, low: 29, close: 15 },
					{ open: 32, high: 534, low: 64, close: 4 },
					{ open: 53, high: 53, low: 54, close: 2 },
					{ open: 43, high: 65, low: 76, close: 34 }
				]
			}
			s.extractData = jest.fn(({ priceData }) => ({
				startIndex: 0,
				endIndex: mockStock.priceData.length
			}))

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

			s.extractData = jest.fn().mockReturnValue({ startIndex: 0, endIndex: 3 })

			const mockStock = {
				priceData: [{ bar: 'first' }, { bar: 'second' }, { bar: 'third' }, { bar: 'fourth' }]
			}
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

			s.groupSignals = jest.fn().mockReturnValue([])

			s.processBar = jest
				.fn()
				.mockReturnValueOnce({ signal: null, context: { call: 'first' } })
				.mockReturnValueOnce({ signal: { type: 'Enter' }, context: { call: 'second' } })
				.mockReturnValueOnce({ signal: { type: 'Exit' }, context: { call: 'third' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'fourth' } })

			s.extractData = jest.fn().mockReturnValue({ startIndex: 0, endIndex: 3 })

			const mockStock = {
				priceData: [{ bar: 'first' }, { bar: 'second' }, { bar: 'third' }, { bar: 'fourth' }]
			}
			const endDate = new Date('1995-12-17T03:24:00').toISOString()

			const { signals } = s.test({ stock: mockStock, endDate })
			expect(signals).toEqual([{ type: 'Enter' }, { type: 'Exit' }])
		})

		it('calls to handle open positions', () => {
			const s = new Strategy({ initialContext: null })
			s.handleOpenPositions = jest.fn().mockReturnValue(null)

			s.groupSignals = jest.fn().mockReturnValue([])

			s.processBar = jest
				.fn()
				.mockReturnValueOnce({ signal: null, context: { call: 'first' } })
				.mockReturnValueOnce({ signal: { type: 'Enter' }, context: { call: 'second' } })
				.mockReturnValueOnce({ signal: { type: 'Exit' }, context: { call: 'third' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'fourth' } })

			s.extractData = jest.fn().mockReturnValue({
				startIndex: 0,
				endIndex: 3
			})

			const mockStock = {
				priceData: [{ bar: 'first' }, { bar: 'second' }, { bar: 'third' }, { bar: 'fourth' }]
			}
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

		it('Groups entry & exit signals', () => {
			const s = new Strategy({ initialContext: null })
			const signals = [{ type: 'enter' }, { type: 'exit' }, { type: 'enter' }, { type: 'exit' }]

			s.groupSignals = jest
				.fn()
				.mockReturnValue([
					[{ type: 'enter' }, { type: 'exit' }],
					[{ type: 'enter' }, { type: 'exit' }]
				])

			s.summarizeSignals({ signals, priceData: [], closeOpenPosition: null })
			expect(s.groupSignals).toHaveBeenCalledWith({ signals, closeOpenPosition: null })
		})

		it('Calls to extract the price data between entry and exit', () => {
			const s = new Strategy({ initialContext: null })
			const signals = [{ type: 'enter' }, { type: 'exit' }, { type: 'enter' }, { type: 'exit' }]

			s.groupSignals = jest
				.fn()
				.mockReturnValue([
					[{ type: 'enter' }, { type: 'exit' }],
					[{ type: 'enter' }, { type: 'exit' }]
				])

			s.assignPriceData = jest.fn().mockReturnValue([])

			s.summarizeSignals({ signals, priceData: [], closeOpenPosition: null })
		})

		it('Creates Trade instance with entry, exit, the stock and pricedata', () => {
			const s = new Strategy({ initialContext: null })
			const signals = [{ type: 'enter' }, { type: 'exit' }, { type: 'enter' }, { type: 'exit' }]

			const mockResponse = [
				{
					entrySignal: { type: 'entry signal' },
					exitSignal: { type: 'exit signal' }
				},
				{
					entrySignal: { type: 'another entry signal' },
					exitSignal: { type: 'another exit signal' }
				}
			]

			s.groupSignals = jest.fn().mockReturnValue(mockResponse)

			s.summarizeSignals({
				signals,
				priceData: [],
				closeOpenPosition: null,
				stock: { name: 'HM AB' }
			})
			expect(Trade).toHaveBeenCalledTimes(2)

			expect(Trade).toHaveBeenCalledWith({
				entry: { type: 'entry signal' },
				exit: { type: 'exit signal' },
				stock: { name: 'HM AB' }
			})
			expect(Trade).toHaveBeenCalledWith({
				entry: { type: 'another entry signal' },
				exit: { type: 'another exit signal' },
				stock: { name: 'HM AB' }
			})
		})

		it('Return array of Trades', () => {
			const s = new Strategy({ initialContext: null })
			const signals = [{ type: 'enter' }, { type: 'exit' }, { type: 'enter' }, { type: 'exit' }]

			const mockResponse = [
				{
					entrySignal: { type: 'entry signal' },
					exitSignal: { type: 'exit signal' }
				},
				{
					entrySignal: { type: 'another entry signal' },
					exitSignal: { type: 'another exit signal' }
				}
			]

			s.groupSignals = jest.fn().mockReturnValue(mockResponse)

			const resp = s.summarizeSignals({ signals, priceData: [], closeOpenPosition: null })

			const isAllTradeInstances = resp.every(trade => trade instanceof Trade)

			expect(isAllTradeInstances).toBe(true)
			expect(resp.length).toBe(2)
		})

		it('Excludes last trade if openPostionPolicy is "exclude" and there was open position', () => {
			const s = new Strategy({ initialContext: null })
			const signals = [{ type: 'enter' }, { type: 'exit' }, { type: 'enter' }, { type: 'exit' }]

			const mockResponse = [
				{
					entrySignal: { type: 'entry signal' },
					exitSignal: { type: 'exit signal' }
				},
				{
					entrySignal: { type: 'another entry signal' },
					exitSignal: { type: 'another exit signal' }
				}
			]

			s.groupSignals = jest.fn().mockReturnValue(mockResponse)

			const resp = s.summarizeSignals({
				signals,
				priceData: [],
				closeOpenPosition: { name: 'this is a mock signal' },
				openPositionPolicy: 'exclude'
			})

			const isAllTradeInstances = resp.every(trade => trade instanceof Trade)

			expect(isAllTradeInstances).toBe(true)
			expect(resp.length).toBe(1)
		})
	})

	describe('Group signals', () => {
		it('Groups signals in arrays of 2', () => {
			const s = new Strategy({ initialContext: null })
			const signals = [{ type: 'enter' }, { type: 'exit' }, { type: 'enter' }, { type: 'exit' }]

			expect(s.groupSignals({ signals })).toEqual([
				[{ type: 'enter' }, { type: 'exit' }],
				[{ type: 'enter' }, { type: 'exit' }]
			])
		})

		it('Adds the signal to close open positions', () => {
			const s = new Strategy({ initialContext: null })
			const signals = [{ type: 'enter' }, { type: 'exit' }, { type: 'enter' }]
			const closeOpenPosition = { type: 'exit' }

			expect(s.groupSignals({ signals, closeOpenPosition })).toEqual([
				[{ type: 'enter' }, { type: 'exit' }],
				[{ type: 'enter' }, { type: 'exit' }]
			])
		})

		it('Validates that each signal group has both entry and exit', () => {
			const s = new Strategy({ initialContext: null })
			const signals = [{ type: 'enter' }, { type: 'exit' }, { type: 'enter' }, { type: 'enter' }]

			try {
				expect(s.groupSignals({ signals }))
			} catch (err) {
				expect(err.message).toBe('Invalid sequence or number of signals')
			}
		})

		it('Validates that each signal group is actually a group', () => {
			const s = new Strategy({ initialContext: null })
			const signals = [{ type: 'enter' }, { type: 'exit' }, { type: 'enter' }]

			try {
				expect(s.groupSignals({ signals }))
			} catch (err) {
				expect(err.message).toBe('Invalid sequence or number of signals')
			}
		})
	})

	describe('extractData', () => {
		it('Should return start + end index', () => {
			const s = new Strategy({ initialContext: null })

			s.searchForDate = jest
				.fn()
				.mockReturnValueOnce(1)
				.mockReturnValueOnce(99)

			const priceData = new Array(100).fill({
				date: 'this is a date',
				open: 1,
				high: 2,
				low: 0.1,
				close: 1
			})

			const startDate = new Date('2019-12-14')
			const endDate = new Date('2019-12-24')

			expect(
				s.extractData({
					priceData,
					startDate,
					endDate
				})
			).toEqual({ startIndex: 1, endIndex: 99 })

			expect(s.searchForDate).toHaveBeenCalledTimes(2)
			expect(s.searchForDate.mock.calls[0][0].priceData).toEqual(priceData)
			expect(s.searchForDate.mock.calls[0][0].date).toEqual(startDate)

			expect(s.searchForDate.mock.calls[1][0].priceData).toEqual(priceData)
			expect(s.searchForDate.mock.calls[1][0].date).toEqual(endDate)
		})

		it('Sets startIndex to 0 if no start provided', () => {
			const s = new Strategy({ initialContext: null })

			s.searchForDate = jest.fn().mockReturnValueOnce(99)

			const priceData = new Array(100).fill({
				date: 'this is a date',
				open: 1,
				high: 2,
				low: 0.1,
				close: 1
			})

			const startDate = null
			const endDate = new Date('2019-12-24')

			expect(
				s.extractData({
					priceData,
					startDate,
					endDate
				})
			).toEqual({ startIndex: 0, endIndex: 99 })
		})

		it('Sets endIndex to array length - 1 if no end provided', () => {
			const s = new Strategy({ initialContext: null })

			s.searchForDate = jest.fn().mockReturnValueOnce(1)

			const priceData = new Array(100).fill({
				date: 'this is a date',
				open: 1,
				high: 2,
				low: 0.1,
				close: 1
			})

			const startDate = new Date('2019-12-24')
			const endDate = null

			expect(
				s.extractData({
					priceData,
					startDate,
					endDate
				})
			).toEqual({ startIndex: 1, endIndex: 99 })
		})
	})

	describe('Search for date', () => {
		it('Throws if date is less than the first date in data', () => {
			expect.assertions(1)

			const s = new Strategy({ initialContext: null })

			// Generate array with the date set to the index + 2
			const priceData = new Array(100).fill(0).map((_, i) => ({ date: new Date(i + 2) }))

			try {
				s.searchForDate({ priceData, date: new Date(1) })
			} catch (err) {
				expect(err.message).toBe('Date is not within provided interval')
			}
		})

		it('Throws if date is greater than the last date in data', () => {
			expect.assertions(1)

			const s = new Strategy({ initialContext: null })

			// Generate array with the date set to the index + 2
			const priceData = new Array(100).fill(0).map((_, i) => ({ date: new Date(i + 2) }))

			try {
				s.searchForDate({ priceData, date: new Date(200) })
			} catch (err) {
				expect(err.message).toBe('Date is not within provided interval')
			}
		})

		it.each([[1000, 99, 98], [25, 24, 23], [1, 1, 0], [2, 2, 1]])(
			'Returns the index of where the date is',
			(arrLength, target, expectedIndex) => {
				const s = new Strategy({ initialContext: null })

				// Generate array with the date set to the index + 1
				const priceData = new Array(arrLength)
					.fill(0)
					.map((_, i) => ({ date: new Date(i + 1) }))

				const resp = s.searchForDate({ priceData, date: new Date(target) })

				expect(resp).toBe(expectedIndex)
			}
		)

		it.each([[100, 51, 26], [250, 127, 64], [100, 37, 19], [200, 199, 100]])(
			'Returns the first value after target if the value is skipped',
			(arrLength, target, expectedIndex) => {
				const s = new Strategy({ initialContext: null })

				// Generate array with the date set to the index + 1
				const priceData = new Array(arrLength)
					.fill(0)
					.map((_, i) => ({ date: new Date(i * 2) }))

				const resp = s.searchForDate({ priceData, date: new Date(target) })

				expect(resp).toBe(expectedIndex)
			}
		)
	})
})
