import { DataSeries } from '../../../src/models/DataSeries'

describe('DataSeries', () => {
	it('throws when given no type', () => {
		try {
			const dataSeries = new DataSeries({
				id: 123,
				name: 'my series',
				data: [{ time: '2002-05-05', value: 24.54 }]
			})
		} catch (e) {
			expect(e.message).toBe('Name, type and data is required')
		}
	})

	it('throws when given no name', () => {
		try {
			const dataSeries = new DataSeries({
				id: 123,
				name: '',
				data: [{ time: '2002-05-05', value: 24.54 }],
				type: 'line'
			})
		} catch (e) {
			expect(e.message).toBe('Name, type and data is required')
		}
	})

	it('throws when given no data', () => {
		try {
			const dataSeries = new DataSeries({ id: 123, name: 'my series', type: 'line' })
		} catch (e) {
			expect(e.message).toBe('Name, type and data is required')
		}
	})

	it('throws when given unknown type', () => {
		try {
			const dataSeries = new DataSeries({
				id: 123,
				name: 'my series',
				data: [{ time: '2002-05-05', value: 24.54 }],
				type: 'elephant'
			})
		} catch (e) {
			expect(e.message).toBe('Unknown chart type')
		}
	})

	it('returns the data when given a correct linechart', () => {
		const dataSeries = new DataSeries({
			id: 123,
			name: 'my series',
			data: [{ time: '2002-05-05', value: 24.54 }],
			type: 'line'
		})
		expect(dataSeries.data).toEqual([{ time: '2002-05-05', value: 24.54 }])
	})

	it.todo('Requires at least 1 datapoint')
	it.todo('Should accept candle type')
	it.todo('Should accept area type')
})
