import Portfolio from '../Portfolio'
import Trade from '../Trade'
import Fee from '../Fee'

const mockTrades = [
	{
		entry: {
			stock: {
				id: 5277,
				name: 'Bure Equity',
				list: 'Mid Cap Stockholm',
				lastPricePoint: null,
				linkName: null,
				dataSeries: []
			},
			price: 101.9,
			date: new Date('2019-01-20T15:16:36.143Z'),
			action: 'buy',
			type: 'enter',
			status: 'executed'
		},
		exit: {
			stock: {
				id: 5277,
				name: 'Bure Equity',
				list: 'Mid Cap Stockholm',
				lastPricePoint: null,
				linkName: null,
				dataSeries: []
			},
			price: 117.24,
			date: new Date('2020-01-19T15:16:36.143Z'),
			action: 'sell',
			type: 'exit',
			status: 'executed'
		},
		stock: {
			id: 5277,
			name: 'Bure Equity',
			list: 'Mid Cap Stockholm',
			lastPricePoint: null,
			linkName: null,
			dataSeries: []
		},
		quantity: 1,
		resultPerStock: 15.34,
		resultPercent: 0.15053974484789
	},
	{
		entry: {
			stock: {
				id: 5277,
				name: 'Bure Equity',
				list: 'Mid Cap Stockholm',
				lastPricePoint: null,
				linkName: null,
				dataSeries: []
			},
			price: 110.47,
			date: new Date('2020-01-19T15:16:36.143Z'),
			action: 'buy',
			type: 'enter',
			status: 'executed'
		},
		exit: {
			stock: {
				id: 5277,
				name: 'Bure Equity',
				list: 'Mid Cap Stockholm',
				lastPricePoint: null,
				linkName: null,
				dataSeries: []
			},
			price: 85.67,
			date: new Date('2021-02-19T15:16:36.143Z'),
			action: 'sell',
			type: 'exit',
			status: 'executed'
		},
		stock: {
			id: 5277,
			name: 'Bure Equity',
			list: 'Mid Cap Stockholm',
			lastPricePoint: null,
			linkName: null,
			dataSeries: []
		},
		quantity: 1,
		resultPerStock: -24.8,
		resultPercent: -0.22449533810084188
	},
	{
		entry: {
			stock: {
				id: 5277,
				name: 'Bure Equity',
				list: 'Mid Cap Stockholm',
				lastPricePoint: null,
				linkName: null,
				dataSeries: []
			},
			price: 66.73,
			date: new Date('2020-01-19T15:16:36.143Z'),
			action: 'buy',
			type: 'enter',
			status: 'executed'
		},
		exit: {
			stock: {
				id: 5277,
				name: 'Bure Equity',
				list: 'Mid Cap Stockholm',
				lastPricePoint: null,
				linkName: null,
				dataSeries: []
			},
			price: 50.05,
			date: new Date('2020-02-19T15:16:36.143Z'),
			action: 'sell',
			type: 'exit',
			status: 'executed'
		},
		stock: {
			id: 5277,
			name: 'Bure Equity',
			list: 'Mid Cap Stockholm',
			lastPricePoint: null,
			linkName: null,
			dataSeries: []
		},
		quantity: 1,
		resultPerStock: -16.68,
		resultPercent: -0.24996253559118842
	}
]

describe('Backtest', () => {
	it('Calls to generate signal map', () => {
		const p = new Portfolio()
		p.generateSignalMaps = jest.fn().mockReturnValue(new Map())

		p.backtest({ trades: mockTrades })

		expect(p.generateSignalMaps).toHaveBeenCalledWith(mockTrades)
	})

	it('Calls to rank signals for each day', () => {
		const p = new Portfolio()
		p.rankSignals = jest.fn().mockReturnValue([])

		p.backtest({ trades: mockTrades })

		expect(p.rankSignals).toHaveBeenCalledTimes(2) // One for each unique date with at least 1 entry signal
	})

	it('Calculates max position value', () => {
		const p = new Portfolio()
		p.calculateMaxPositionValue = jest.fn(p.calculateMaxPositionValue)

		p.backtest({ trades: [mockTrades[0]] })

		expect(p.calculateMaxPositionValue).toHaveBeenCalledTimes(1)

		expect(p.calculateMaxPositionValue.mock.calls[0][0]).toEqual(100000)
	})
	/*
	TODO This test needs logic for closing positions to be able to work properly
	it('Can buy cheaper stock if there isnt room for more expensive', () => {
		const diversePricedStocks = [
			{
				entry: {
					stock: {
						id: 5277,
						name: 'expensive stock',
						list: 'Mid Cap Stockholm',
						lastPricePoint: null,
						linkName: null,
						dataSeries: []
					},
					price: 100000.9,
					date: new Date('2019-01-20T15:16:36.143Z'),
					action: 'buy',
					type: 'enter',
					status: 'executed'
				},
				exit: {
					stock: {
						id: 5277,
						name: 'expensive stock',
						list: 'Mid Cap Stockholm',
						lastPricePoint: null,
						linkName: null,
						dataSeries: []
					},
					price: 100000.24,
					date: new Date('2020-01-19T15:16:36.143Z'),
					action: 'sell',
					type: 'exit',
					status: 'executed'
				},
				stock: {
					id: 5277,
					name: 'expensive stock',
					list: 'Mid Cap Stockholm',
					lastPricePoint: null,
					linkName: null,
					dataSeries: []
				},
				quantity: 1,
				resultPerStock: 15.34,
				resultPercent: 0.15053974484789
			},
			{
				entry: {
					stock: {
						id: 5277,
						name: 'Bure Equity',
						list: 'Mid Cap Stockholm',
						lastPricePoint: null,
						linkName: null,
						dataSeries: []
					},
					price: 110.47,
					date: new Date('2020-01-19T15:16:36.143Z'),
					action: 'buy',
					type: 'enter',
					status: 'executed'
				},
				exit: {
					stock: {
						id: 5277,
						name: 'Bure Equity',
						list: 'Mid Cap Stockholm',
						lastPricePoint: null,
						linkName: null,
						dataSeries: []
					},
					price: 85.67,
					date: new Date('2021-02-19T15:16:36.143Z'),
					action: 'sell',
					type: 'exit',
					status: 'executed'
				},
				stock: {
					id: 5277,
					name: 'Bure Equity',
					list: 'Mid Cap Stockholm',
					lastPricePoint: null,
					linkName: null,
					dataSeries: []
				},
				quantity: 1,
				resultPerStock: -24.8,
				resultPercent: -0.22449533810084188
			}
		]

		const p = new Portfolio()
		p.calculateMaxPositionValue = jest.fn(p.calculateMaxPositionValue)

		const resp = p.backtest({ trades: diversePricedStocks })
		expect([...p.openTrades]).toEqual(null)
	})
	*/
	it('Withdraws cash on entry', () => {
		const tradeWithoutExit = new Trade({
			entry: {
				stock: {
					id: 5277,
					name: 'expensive stock',
					list: 'Mid Cap Stockholm',
					lastPricePoint: null,
					linkName: null,
					dataSeries: []
				},
				price: 101.9,
				date: new Date('2019-01-20T15:16:36.143Z'),
				action: 'buy',
				type: 'enter',
				status: 'executed'
			},
			exit: {
				stock: {
					id: 5277,
					name: 'expensive stock',
					list: 'Mid Cap Stockholm',
					lastPricePoint: null,
					linkName: null,
					dataSeries: []
				},
				price: 117.24,
				date: new Date('2020-01-19T15:16:36.143Z'),
				action: 'sell',
				type: 'exit',
				status: 'executed'
			},
			stock: {
				id: 5277,
				name: 'expensive stock',
				list: 'Mid Cap Stockholm',
				lastPricePoint: null,
				linkName: null,
				dataSeries: []
			},
			quantity: 1,
			resultPerStock: 15.34,
			resultPercent: 0.15053974484789
		})

		const p = new Portfolio({ startCapital: 100000 })

		p.generateSignalMaps = jest
			.fn()
			.mockReturnValue(
				new Map().set('2019-01-20T15:16:36.143Z', { entry: [tradeWithoutExit], exit: [] })
			)

		p.backtest({ trades: [tradeWithoutExit] })
		expect(p.cashAvailable).toEqual(95108.8)
	})

	it('Removes slot from availability on entry', () => {
		const tradeWithoutExit = new Trade({
			entry: {
				stock: {
					id: 5277,
					name: 'expensive stock',
					list: 'Mid Cap Stockholm',
					lastPricePoint: null,
					linkName: null,
					dataSeries: []
				},
				price: 101.9,
				date: new Date('2019-01-20T15:16:36.143Z'),
				action: 'buy',
				type: 'enter',
				status: 'executed'
			},
			exit: {
				stock: {
					id: 5277,
					name: 'expensive stock',
					list: 'Mid Cap Stockholm',
					lastPricePoint: null,
					linkName: null,
					dataSeries: []
				},
				price: 117.24,
				date: new Date('2020-01-19T15:16:36.143Z'),
				action: 'sell',
				type: 'exit',
				status: 'executed'
			},
			stock: {
				id: 5277,
				name: 'expensive stock',
				list: 'Mid Cap Stockholm',
				lastPricePoint: null,
				linkName: null,
				dataSeries: []
			},
			quantity: 1,
			resultPerStock: 15.34,
			resultPercent: 0.15053974484789
		})

		const p = new Portfolio({ startCapital: 100000 })

		p.generateSignalMaps = jest
			.fn()
			.mockReturnValue(
				new Map().set('2019-01-20T15:16:36.143Z', { entry: [tradeWithoutExit], exit: [] })
			)

		expect(p.openPositions).toEqual(0)
		p.backtest({ trades: [tradeWithoutExit] })
		expect(p.openPositions).toEqual(1)
	})

	it('Calls to calculate quantity with max position value', () => {
		const trade = new Trade(mockTrades[0])
		trade.calculateQuantity = jest.fn(trade.calculateQuantity)

		const p = new Portfolio({ feeMinimum: 0, feePercentage: 0, maxNumberOfStocks: 20 })

		p.backtest({ trades: [trade] })

		expect(trade.calculateQuantity).toHaveBeenCalledWith(5000)
		expect(trade.calculateQuantity).toHaveBeenCalledTimes(1)
		expect(trade.quantity).toBe(49)
	})

	it('Does not add any trades if there isnt any slots open', () => {
		const trade = new Trade(mockTrades[0])
		trade.calculateQuantity = jest.fn(trade.calculateQuantity)

		const p = new Portfolio({ feeMinimum: 0, feePercentage: 0, maxNumberOfStocks: 0 })

		p.backtest({ trades: [trade] })

		expect(trade.calculateQuantity).not.toHaveBeenCalled()
		expect(trade.quantity).toBe(1) // Default quantity
	})

	it('Removes trade from currently holding upon exit', () => {
		const p = new Portfolio()
		p.backtest({ trades: mockTrades })
		expect(p.openTrades.size).toBe(0)
	})

	it('Adds closed trades to historicalTrades', () => {
		const p = new Portfolio()
		p.backtest({ trades: mockTrades })
		expect(p.historicalTrades.length).toBe(mockTrades.length)
	})

	it('Adds availability on exit', () => {
		const p = new Portfolio()
		p.backtest({ trades: mockTrades })
		expect(p.openPositions).toBe(0)
	})

	it('Deposits cash on exit', () => {
		const p = new Portfolio()
		p.backtest({ trades: [mockTrades[0]] })
		expect(p.cashAvailable).toBe(100736.32)

		p.backtest({ trades: mockTrades })
		expect(p.cashAvailable).toBe(98369.32)
	})
	it.todo('Can handle trades that are still open at end of test')
	it.todo('Can handle pending signals')
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

		const resp = p.generateSignalMaps(mockTrades).get('2020-01-19T15:16:36.143Z')
		expect(resp.entry.length).toBe(2)
		expect(resp.exit.length).toBe(1)
	})
})

describe('calculateMaxPositionValue', () => {
	it('returns max amount to buy for', () => {
		const p = new Portfolio()
		const f = new Fee({ percentage: 0, minimum: 1 })

		const resp = p.calculateMaxPositionValue(100000, f, 10)
		expect(resp).toBe(9999.9)

		const resp2 = p.calculateMaxPositionValue(100000, f, 20)
		expect(resp2).toBe(4999.95)
	})

	it('defaults to #availableSlots', () => {
		const p = new Portfolio({ maxNumberOfStocks: 10 })
		const f = new Fee({ percentage: 0, minimum: 1 })

		const resp = p.calculateMaxPositionValue(100000, f)
		expect(resp).toBe(9999.9)

		const resp2 = p.calculateMaxPositionValue(100000, f)
		expect(resp2).toBe(9999.9)
	})
})

describe('Rank Signals', () => {
	it.todo('needs tests')
})
