import Trade from '../Trade'
import mockData from './__mocks__/tradeData.json'
import Signal from '../Signal'
import Fee from '../Fee'
// jest.mock('../Signal')

// Convert the dates
const entrySignal = mockData.entrySignal
const exitSignal = mockData.exitSignal

describe('Trade', () => {
	let entry
	let exit

	beforeEach(() => {
		// Create signal instances
		entry = new Signal(entrySignal)
		exit = new Signal(exitSignal)
	})

	it('Has a working constructor', () => {
		const t = new Trade({
			entry,
			exit
		})

		expect(t instanceof Trade).toBe(true)
	})

	it('Adds the stock as props', () => {
		const t = new Trade({
			entry,
			exit,
			stock: { name: 'HM AB' }
		})

		expect(t.stock.name).toBe('HM AB')
	})

	it('Sets quantity to 1 by default', () => {
		const t = new Trade({
			entry,
			exit
		})

		expect(t.quantity).toBe(1)
	})

	it('Can set quantity', () => {
		const t = new Trade({
			entry,
			exit
		})

		expect(t.quantity).toBe(1)
		t.setQuantity(1234)
		expect(t.quantity).toBe(1234)
	})

	it('Calculates $ profit/loss per stock', () => {
		const t = new Trade({
			entry,
			exit
		})

		expect(t.resultPerStock).toBe(9.1)
	})

	it('Calculates % profit/loss', () => {
		const t = new Trade({
			entry,
			exit
		})

		expect(t.resultPercent).toBe(0.2643043857101366)
		expect(t.roundNumber(t.resultPercent * t.entry.price)).toBe(t.resultInCash)
	})

	it('Calculates $ profit/loss', () => {
		const t = new Trade({
			entry,
			exit
		})

		expect(t.resultPerStock).toBe(t.resultInCash)
		t.setQuantity(20)
	})

	it('updates $ profit/loss when changing quantity', () => {
		const t = new Trade({
			entry,
			exit
		})

		expect(t.resultInCash).toBe(t.resultPerStock)
		t.setQuantity(20)
		expect(t.resultInCash).toBe(t.resultPerStock * 20)
	})

	it('updates position values when changing quantity', () => {
		const t = new Trade({
			entry,
			exit
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
			quantity: 123
		})

		expect(t.initialValue).toBe(4234.89)
	})
	it('Can get final position value', () => {
		const t = new Trade({
			entry,
			exit,
			quantity: 123
		})

		expect(t.finalValue).toBe(5354.19)
	})

	it('setting fee returns Trade instance', () => {
		const t = new Trade({
			entry,
			exit,
			quantity: 123
		})

		const fee = new Fee({ percentage: 0.01, minimum: 25 })

		const resp = t.setFee(fee)
		expect(resp instanceof Trade).toBe(true)
	})

	it('entry- & exitprice is updated after setting fee', () => {
		const t = new Trade({
			entry,
			exit,
			quantity: 123
		})

		const fee = new Fee({ percentage: 0.01, minimum: 25 })

		expect(t.entryPrice).toBe(34.43)
		expect(t.exitPrice).toBe(43.53)
		t.setFee(fee)
		expect(t.entryPrice).toBe(35.05421869918699)
		expect(t.exitPrice).toBe(42.74079756097561)
	})

	it('calculates total fees', () => {
		const t = new Trade({
			entry,
			exit,
			quantity: 100
		})

		const fee = new Fee({ percentage: 0.01, minimum: 25 })

		t.setFee(fee)
		expect(t.totalFees).toBe(77.96)
		t.setQuantity(200)
		expect(t.totalFees).toBe(155.92)
	})

	it('updates initial- & finalValue after setting fee', () => {
		const t = new Trade({
			entry,
			exit,
			quantity: 100
		})

		const fee = new Fee({ percentage: 0.01, minimum: 25 })

		expect(t.initialValue).toBe(3443)
		expect(t.finalValue).toBe(4353)
		t.setFee(fee)
		expect(t.initialValue).toBe(3511.86)
		expect(t.finalValue).toBe(4265.94)
	})

	it('Updates results after changing fees', () => {
		const t = new Trade({
			entry,
			exit,
			quantity: 100
		})

		const fee = new Fee({ percentage: 0.01, minimum: 25 })

		expect(t.resultPerStock).toBe(9.1)
		expect(t.resultPercent).toBe(0.2643043857101366)
		t.setFee(fee)
		expect(t.resultPerStock).toBe(7.5408)
		expect(t.resultPercent).toBe(0.21472382156464098)
	})

	it.todo('Throws if start date is not equal to entry signal date')
	it.todo('require end date to be equal to exit signal date')
	it.todo('Creates array with position value throughout the whole trade')
	it.todo('Calculates p/l for each bar')
})
