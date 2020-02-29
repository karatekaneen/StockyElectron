import TradeAnalyzer from '../TradeAnalyzer'

describe('TradeAnalyzer', () => {
	const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, -2, -4, -5, -7.6]

	it('Works without any data passed in', () => {
		const resp = TradeAnalyzer.analyze([])
		expect(resp).toEqual({
			averageLoss: NaN,
			averageTrade: NaN,
			averageWin: NaN,
			gainLossRatio: NaN,
			loserate: NaN,
			losses: 0,
			maxGain: 0,
			maxLoss: 0,
			numberOfTrades: 0,
			profitFactor: NaN,
			totalGains: 0,
			totalLoss: 0,
			winrate: NaN,
			wins: 0,
			winSTD: null,
			lossSTD: null,
			tradeSTD: null
		})
	})

	it('Requires all items to be numbers', () => {
		expect.assertions(1)

		try {
			const resp = TradeAnalyzer.analyze([1, 2, 3, 4, 5, 'wrong'])
		} catch (err) {
			expect(err.message).toBe('Array must only consist of numbers')
		}
	})
	it('Counts the total number of trades', () => {
		expect(TradeAnalyzer.analyze(testData).numberOfTrades).toBe(testData.length)
	})

	it('Counts the wins', () => {
		expect(TradeAnalyzer.analyze(testData).wins).toBe(9)
	})

	it('Counts the losses', () => {
		expect(TradeAnalyzer.analyze(testData).losses).toBe(4)
	})

	it('Calculates win rate', () => {
		expect(TradeAnalyzer.analyze(testData).winrate).toBe(0.6923076923076923)
	})

	it('Calculates average trade result', () => {
		expect(TradeAnalyzer.analyze(testData).averageTrade).toBe(2.0307692307692307)
	})

	it('Calculates average win size', () => {
		expect(TradeAnalyzer.analyze(testData).averageWin).toBe(5)
	})

	it('Calculates average loss size', () => {
		expect(TradeAnalyzer.analyze(testData).averageLoss).toBe(-4.65)
	})

	it('Calculates gain/loss-ratio', () => {
		expect(TradeAnalyzer.analyze(testData).gainLossRatio).toBe(1.075268817204301)
	})

	it('Calculates profit factor', () => {
		expect(TradeAnalyzer.analyze(testData).profitFactor).toBe(2.419354838709677)
	})

	it('Calculates STD of trades', () => {
		expect(TradeAnalyzer.analyze(testData).tradeSTD).toBe(5.276896912546333)
	})

	it('Calculates STD of wins', () => {
		expect(TradeAnalyzer.analyze(testData).winSTD).toBe(2.7386127875258306)
	})

	it('Calculates STD of losses', () => {
		expect(TradeAnalyzer.analyze(testData).lossSTD).toBe(2.3288051299611423)
	})

	it('Gets the largest win', () => {
		expect(TradeAnalyzer.analyze(testData).maxGain).toBe(9)
	})

	it('Gets the largest loss', () => {
		expect(TradeAnalyzer.analyze(testData).maxLoss).toBe(-7.6)
	})
})
