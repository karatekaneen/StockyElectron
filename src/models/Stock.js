import _DataSeries from './DataSeries'

export default class Stock {
	constructor({ DataSeries = _DataSeries, data = {} }) {
		// Add deps:
		this.DataSeries = _DataSeries

		// Assign data:
		const { id, name, list, priceData, lastPricePoint, linkName } = data
		this.id = id || null
		this.name = name || null
		this.list = list || null
		this.lastPricePoint = lastPricePoint || null
		this.linkName = linkName || null

		if (priceData) {
			this.priceData = this.dateToTime(priceData)
		} else {
			this.priceData = null
		}

		this.dataSeries = []
	}

	createCandleStickSeries() {
		const data = this.priceData.map(p => ({
			time: p.time,
			open: p.open,
			high: p.high,
			low: p.low,
			close: p.close
		}))

		const d = new this.DataSeries({ name: `${this.name} Price`, type: 'candlestick', data })
		this.dataSeries.push(d)
	}

	/**
	 *  Save the date under the prop `time` with the format yyyy-mm-dd to be able to pass it directly to chart
	 * @param {Array<Object>} priceData The OHLCV+ date data from the API
	 * @returns {Array<Object>} the original array with the `time` property added with date in `YYYY-MM-DD`
	 */
	dateToTime(priceData) {
		return priceData.map(pricePoint => {
			if (!pricePoint.date) throw new Error('Date is required')
			else {
				const d = new Date(pricePoint.date)
				pricePoint.time = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
				return pricePoint
			}
		})
	}
}