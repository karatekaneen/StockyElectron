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

		expect(s.getSignal()).toBe('woop')
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

			s.getSignal = jest.fn().mockReturnValue({ signal: null, context: null })

			s.extractData = jest
				.fn()
				.mockReturnValue([{ bar: 'first' }, { bar: 'second' }, { bar: 'third' }])

			const mockStock = { priceData: ['Array of price data'] }
			const endDate = new Date('1995-12-17T03:24:00').toISOString()

			s.test({ stock: mockStock, endDate })

			expect(s.getSignal).toHaveBeenCalledTimes(2) // Not calling for the first bar due to lookback
		})

		it('Updates context every bar', () => {
			const s = new Strategy({ initialContext: null })

			s.getSignal = jest
				.fn()
				.mockReturnValueOnce({ signal: null, context: { call: 'first' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'second' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'third' } })

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

			expect(s.getSignal.mock.calls[0][0].context).toBe(null)
			expect(s.getSignal.mock.calls[1][0].context).toEqual({ call: 'first' })
			expect(s.getSignal.mock.calls[2][0].context).toEqual({ call: 'second' })
		})

		it('Returns historical context', () => {
			const s = new Strategy({ initialContext: null })

			s.getSignal = jest
				.fn()
				.mockReturnValueOnce({ signal: null, context: { call: 'first' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'second' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'third' } })

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

			s.getSignal = jest
				.fn()
				.mockReturnValueOnce({ signal: null, context: { call: 'first' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'second' } })
				.mockReturnValueOnce({ signal: null, context: { call: 'third' } })

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

			s.getSignal = jest
				.fn()
				.mockReturnValueOnce({ signal: null, context: { call: 'first' } })
				.mockReturnValueOnce({ signal: { type: 'Enter' }, context: { call: 'second' } })
				.mockReturnValueOnce({ signal: { type: 'Exit' }, context: { call: 'third' } })

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
})
