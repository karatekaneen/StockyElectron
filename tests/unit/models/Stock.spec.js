import Stock from '../../../src/models/Stock'
import DataSeries from '../../../src/models/DataSeries'
jest.mock('../../../src/models/DataSeries')

describe('Stock', () => {
	it('Assigns null if no value is passed', () => {
		const stock = new Stock({ data: { name: 'SKF AB', id: 1234 } })
		expect(stock.list).toBe(null)
		expect(stock.priceData).toBe(null)
		expect(stock.id).toBe(1234)
	})

	describe('dateToTime', () => {
		it('Returns a correctly formatted date string when given ISO date', () => {
			const s = new Stock({})
			const resp = s.dateToTime([{ date: '2019-10-26T14:50:10.462Z' }])
			expect(resp[0].time).toBe('2019-10-26')
		})

		it('throws if date is falsy', () => {
			expect.assertions(1)
			const s = new Stock({})
			try {
				const resp = s.dateToTime([{ date: null }])
			} catch (err) {
				expect(err.message).toBe('Date is required')
			}
		})
	})

	describe('createCandleStickSeries', () => {
		it('Creates a candlestick DataSeries when called with correct data', () => {
			const testData = {
				name: 'SKF',
				list: 'Large Cap Stockholm',
				priceData: [
					{ date: '2019-10-26T14:50:10.462Z', open: 12, high: 14, low: 12, close: 13 },
					{ date: '2019-10-27T14:50:10.462Z', open: 13, high: 14, low: 12, close: 14 }
				]
			}
			const stock = new Stock({
				DataSeries,
				data: testData
			})
			stock.createCandleStickSeries()

			expect(stock.dataSeries.length).toBe(1)
			const mock = DataSeries.mock.instances[0]
			const { data, name, type } = mock.constructor.mock.calls[0][0]
			expect(data).toEqual([
				{ close: 13, high: 14, low: 12, open: 12, time: '2019-10-26' },
				{ close: 14, high: 14, low: 12, open: 13, time: '2019-10-27' }
			])

			expect(name).toBe('SKF Price')
			expect(type).toBe('candlestick')
		})
	})

	it.todo('should be able to make line chart')
	it.todo('should be able to make area chart')
})
