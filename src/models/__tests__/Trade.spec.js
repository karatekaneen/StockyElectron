import Trade from '../Trade'
import mockData from './__mocks__/tradeData.json'
import Signal from '../Signal'
// jest.mock('../Signal')

// Convert the dates
const entrySignal = mockData.entrySignal
const exitSignal = mockData.exitSignal
entrySignal.date = new Date(entrySignal.date)
exitSignal.date = new Date(exitSignal.date)

// Convert the price
// entrySignal.price = Number(entrySignal.price)
// exitSignal.price = Number(exitSignal.price)

// Convert the dates to proper Date instances
const tradeData = mockData.priceData.map(pricePoint => {
	pricePoint.date = new Date(pricePoint.date)
	return pricePoint
})

describe('Trade', () => {
	let entry
	let exit

	beforeEach(() => {
		// Create signal instances
		entry = new Signal(entrySignal)
		exit = new Signal(exitSignal)
	})

	it('Throws if entry and exit isnt signal instances', () => {
		expect.assertions(1)

		try {
			const t = new Trade({ entry: null, exit: null, tradeData: [] })
		} catch (err) {
			expect(err.message).toBe('Entry and exit must be Signal instances')
		}
	})

	it('Has a working constructor', () => {
		const t = new Trade({
			entry,
			exit,
			tradeData
		})

		expect(t instanceof Trade).toBe(true)
	})

	it('Adds the stock as props', () => {
		const t = new Trade({
			entry,
			exit,
			tradeData,
			stock: { name: 'HM AB' }
		})

		expect(t.stock.name).toBe('HM AB')
	})

	it('Throws if start date is not equal to entry signal date', () => {
		expect.assertions(1)

		entry.date = new Date('1999-01-02')

		try {
			const t = new Trade({
				entry,
				exit,
				tradeData
			})
		} catch (err) {
			expect(err.message).toBe('Invalid date range')
		}
	})

	it('require end date to be equal to exit signal date', () => {
		expect.assertions(1)

		exit.date = new Date('1999-01-02')

		try {
			const t = new Trade({
				entry,
				exit,
				tradeData
			})
		} catch (err) {
			expect(err.message).toBe('Invalid date range')
		}
	})

	it('Sets quantity to 1 by default', () => {
		const t = new Trade({
			entry,
			exit,
			tradeData
		})

		expect(t.quantity).toBe(1)
	})

	it('Can set quantity', () => {
		const t = new Trade({
			entry,
			exit,
			tradeData
		})

		expect(t.quantity).toBe(1)
		t.setQuantity(1234)
		expect(t.quantity).toBe(1234)
	})

	it('Calculates $ profit/loss per stock', () => {
		const t = new Trade({
			entry,
			exit,
			tradeData
		})

		expect(t.resultPerStock).toBe(9.1)
	})

	it('Calculates % profit/loss', () => {
		const t = new Trade({
			entry,
			exit,
			tradeData
		})

		expect(t.resultPercent).toBe(0.2643043857101366)
		expect(t.roundNumber(t.resultPercent * t.entry.price)).toBe(t.resultInCash)
	})

	it('Calculates $ profit/loss', () => {
		const t = new Trade({
			entry,
			exit,
			tradeData
		})

		expect(t.resultPerStock).toBe(t.resultInCash)
		t.setQuantity(20)
	})

	it('updates $ profit/loss when changing quantity', () => {
		const t = new Trade({
			entry,
			exit,
			tradeData
		})

		expect(t.resultInCash).toBe(t.resultPerStock)
		t.setQuantity(20)
		expect(t.resultInCash).toBe(t.resultPerStock * 20)
	})

	it('updates position values when changing quantity', () => {
		const t = new Trade({
			entry,
			exit,
			tradeData
		})

		expect(t.initialValue).toBe(t.entry.price)
		expect(t.finalValue).toBe(t.exit.price)
		t.setQuantity(20)
		expect(t.initialValue).toBe(t.entry.price * 20)
		expect(t.finalValue).toBe(t.exit.price * 20)
	})

	it('Can get initial position value', () => {
		const t = new Trade({
			entry,
			exit,
			tradeData,
			quantity: 123
		})

		expect(t.initialValue).toBe(4234.89)
	})
	it('Can get final position value', () => {
		const t = new Trade({
			entry,
			exit,
			tradeData,
			quantity: 123
		})

		expect(t.finalValue).toBe(5354.19)
	})

	it('Creates array with position value throughout the whole trade', () => {
		const t = new Trade({
			entry,
			exit,
			tradeData,
			quantity: 123
		})

		const resp = t.calculatePerformancePercent({ entryPrice: entry.price, tradeData })
		const performanceOHLC = resp.map(({ open, high, low, close }) => ({ open, high, low, close }))
		const storedPerf = t.performancePercent.map(({ open, high, low, close }) => ({
			open,
			high,
			low,
			close
		}))

		expect(storedPerf).toEqual(performanceOHLC)
		expect(performanceOHLC).toEqual([
			{
				close: 0.02788266047051992,
				high: 0.03398199244844617,
				low: -0.008132442637235003,
				open: 0
			},
			{
				close: -0.018007551553877357,
				high: 0.018007551553877357,
				low: -0.02004066221318611,
				open: 0.018007551553877357
			},
			{
				close: -0.03601510310775492,
				high: -0.02410688353180361,
				low: -0.04821376706360722,
				open: -0.03194888178913742
			},
			{
				close: 0.00377577693871631,
				high: 0.018007551553877357,
				low: -0.040081324426372425,
				open: -0.03601510310775492
			},
			{
				close: 0.02788266047051992,
				high: 0.05198954400232353,
				low: -0.004066221318617501,
				open: -0.004066221318617501
			},
			{
				close: 0.015974440894568606,
				high: 0.03979088004647103,
				low: 0.007841998257333812,
				open: 0.03979088004647103
			},
			{
				close: 0.015974440894568606,
				high: 0.02991577112982867,
				low: 0,
				open: 0.00377577693871631
			},
			{
				close: 0.02788266047051992,
				high: 0.03194888178913742,
				low: 0.011908219575951312,
				open: 0.02004066221318611
			},
			{
				close: 0.02991577112982867,
				high: 0.03979088004647103,
				low: 0.0058088875980250605,
				open: 0.03194888178913742
			},
			{
				close: 0.03979088004647103,
				high: 0.04385710136508853,
				low: 0.02004066221318611,
				open: 0.02381643915190242
			},
			{
				close: 0.03979088004647103,
				high: 0.04792332268370603,
				low: 0.03194888178913742,
				open: 0.04792332268370603
			},
			{
				close: 0.03194888178913742,
				high: 0.03979088004647103,
				low: 0.00377577693871631,
				open: 0.011908219575951312
			},
			{
				close: 0.02004066221318611,
				high: 0.03601510310775492,
				low: 0,
				open: 0.26430438571013654
			}
		])
	})

	it('Calculates p/l for each bar', () => {
		const t = new Trade({
			entry,
			exit,
			tradeData,
			quantity: 1000
		})

		const withoutDate = t.performanceCash.map(({ open, high, low, close }) => ({
			open,
			high,
			low,
			close
		}))

		expect(withoutDate).toEqual([
			{ close: 960, high: 1170, low: -280, open: 0 },
			{ close: -620, high: 620, low: -690, open: 620 },
			{ close: -1240, high: -830, low: -1660, open: -1100 },
			{ close: 130, high: 620, low: -1380, open: -1240 },
			{ close: 960, high: 1790, low: -140, open: -140 },
			{ close: 550, high: 1370, low: 270, open: 1370 },
			{ close: 550, high: 1030, low: 0, open: 130 },
			{ close: 960, high: 1100, low: 410, open: 690 },
			{ close: 1030, high: 1370, low: 200, open: 1100 },
			{ close: 1370, high: 1510, low: 690, open: 820 },
			{ close: 1370, high: 1650, low: 1100, open: 1650 },
			{ close: 1100, high: 1370, low: 130, open: 410 },
			{ close: 690, high: 1240, low: 0, open: 9100 }
		])
	})
})
