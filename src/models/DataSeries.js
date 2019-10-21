export class DataSeries {
	constructor({ id, name, type, data }) {
		if (!name || !type || !data) throw new Error('Name, type and data is required')
		else {
			this.id = id // Redundant?
			this.name = name // Name to display
			this.type = type // Line/chart/area etc
			this.data = this.validateData(data, type)
		}
		//
		// this.priceData = this.dateToTime(priceData)
	}

	validateData(data, type) {
		if (type === 'line') {
			if (data.every(({ time, value }) => time && (value || value === null))) return data
			else throw new Error('Invalid data format for line chart')
		} else {
			throw new Error('Unknown chart type')
		}
	}

	/**
	 *  Save the date under the prop `time` with the format yyyy-mm-dd to be able to pass it directly to chart
	 * @todo Den här ska in i en `stock`-class istället.
	 * @param {Array<Object>} priceData The OHLCV+ date data from the API
	 * @returns {Array<Object>} the original array with the `time` property added with date in `YYYY-MM-DD`
	 */
	// dateToTime(priceData) {
	// 	return priceData.map(pricePoint => {
	// 		const d = new Date(pricePoint.date)
	// 		pricePoint.time = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
	// 		return pricePoint
	// 	})
	// }
}
