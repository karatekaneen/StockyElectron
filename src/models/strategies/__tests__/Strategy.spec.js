import Strategy from '../Strategy'

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

		it.todo('Checks for identical tests before running')
	})

	describe('Summarize Signals', () => {
		it.todo('Groups entry & exit signals together if signal array length is even')
		it.todo('Generates exit signal for open position if signal array length is odd')
		it.todo('Throws if signals length is odd and last signal is to exit')
		it.todo('Calls to extract the price data between entry and exit')
		it.todo('Creates Trade instance with entry, exit and pricedata')
		it.todo('Return array of Trades')
	})
})
