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

		it.todo('Checks for identical tests before running')
		it.todo('Checks for signal every bar')
		it.todo('Returns array of signals and historical context')
	})
})
