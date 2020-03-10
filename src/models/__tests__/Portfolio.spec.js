import Portfolio from '../Portfolio'
const mockTrades = [
	{
		name: 'test 1',
		entry: {
			date: new Date('2020-01-19T15:16:36.143Z')
		},
		exit: {
			date: new Date('2020-02-19T15:16:36.143Z')
		}
	},
	{
		name: 'test 2',
		entry: {
			date: new Date('2019-01-20T15:16:36.143Z')
		},
		exit: {
			date: new Date('2021-02-19T15:16:36.143Z')
		}
	},
	{
		name: 'test 3',
		entry: {
			date: new Date('2020-02-19T15:16:36.143Z')
		},
		exit: {
			date: new Date('2020-02-19T15:16:36.143Z')
		}
	}
]

describe('Backtest', () => {
	it('test', () => {
		const p = new Portfolio()

		const resp = p.backtest({ trades: mockTrades })
	})
})

describe('generateSignalMaps', () => {
	it('Groups the trades by entry & exit date', () => {
		const p = new Portfolio()

		const resp = p.generateSignalMaps(mockTrades)
		expect(resp instanceof Map).toBe(true)
		expect(resp.size).toBe(4) // Number of unique dates in mockTrades
	})

	it('Sorts the keys chronologically', () => {
		const p = new Portfolio()

		const resp = [...p.generateSignalMaps(mockTrades).keys()]
		expect(resp).toEqual([
			'2019-01-20T15:16:36.143Z',
			'2020-01-19T15:16:36.143Z',
			'2020-02-19T15:16:36.143Z',
			'2021-02-19T15:16:36.143Z'
		])
	})

	it('Allows multiple entries on same date', () => {
		const p = new Portfolio()

		const resp = p.generateSignalMaps(mockTrades).get('2020-02-19T15:16:36.143Z')
		expect(resp.entry.length).toBe(1)
		expect(resp.exit.length).toBe(2)
	})
})
