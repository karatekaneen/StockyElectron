export class Stock {
	constructor({ id, name, list, priceData, lastPricePoint, linkName }) {
		if (id) this.id = id
		if (name) this.name = name
		if (list) this.list = list
		if (lastPricePoint) this.lastPricePoint = lastPricePoint
		if (linkName) this.linkName = linkName
		if (priceData) {
			this.priceData = this.dateToTime(priceData)
		}
	}

	/**
	 *  Save the date under the prop `time` with the format yyyy-mm-dd to be able to pass it directly to chart
	 * @param {Array<Object>} priceData The OHLCV+ date data from the API
	 * @returns {Array<Object>} the original array with the `time` property added with date in `YYYY-MM-DD`
	 */
	dateToTime(priceData) {
		return priceData.map(pricePoint => {
			const d = new Date(pricePoint.date)
			pricePoint.time = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
			return pricePoint
		})
	}
}
