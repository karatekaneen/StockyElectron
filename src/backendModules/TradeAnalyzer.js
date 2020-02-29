const calculateSTD = (data, average) => {
	if (data && data.length > 0 && average) {
		return Math.sqrt(data.reduce((sq, n) => sq + Math.pow(n - average, 2), 0) / (data.length - 1))
	}

	return null
}

const analyze = values => {
	if (values.some(val => typeof val !== 'number')) {
		throw new Error('Array must only consist of numbers')
	}
	const wins = []

	const losses = []

	const results = values.reduce(
		(agg, current) => {
			agg.numberOfTrades++
			if (current > 0) {
				agg.wins++
				agg.totalGains += current
				agg.maxGain = Math.max(agg.maxGain, current)
				wins.push(current)
			} else {
				agg.losses++
				agg.totalLoss += current
				agg.maxLoss = Math.min(agg.maxLoss, current)
				losses.push(current)
			}
			return agg
		},
		{ wins: 0, losses: 0, numberOfTrades: 0, totalGains: 0, totalLoss: 0, maxGain: 0, maxLoss: 0 }
	)

	results.winrate = results.wins / results.numberOfTrades
	results.loserate = results.losses / results.numberOfTrades
	results.averageTrade = (results.totalLoss + results.totalGains) / results.numberOfTrades
	results.averageWin = results.totalGains / results.wins
	results.averageLoss = results.totalLoss / results.losses
	results.gainLossRatio = results.averageWin / -results.averageLoss
	results.profitFactor =
		(results.averageWin * results.winrate) / (-results.averageLoss * results.loserate)

	results.tradeSTD = calculateSTD([...wins, ...losses], results.averageTrade)
	results.winSTD = calculateSTD(wins, results.averageWin)
	results.lossSTD = calculateSTD(losses, results.averageLoss)

	return results
}

export default { analyze }
