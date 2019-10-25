export class DataSeries {
	constructor({ id, name, type, data }) {
		if (!name || !type || !data) throw new Error('Name, type and data is required')
		else {
			this.id = id // Redundant?
			this.name = name // Name to display
			this.type = type // Line/chart/area etc
			this.data = this.validateData(data, type)
		}
	}

	validateData(data, type) {
		if (data.length < 1 || !Array.isArray(data)) {
			throw new Error('At least 1 datapoint must be provided')
		} else {
			if (type === 'line') {
				if (this.validateLineChartData(data)) {
					return data
				} else {
					throw new Error('Invalid data format for line chart')
				}
			} else if (type === 'candlestick') {
				if (this.validateCandleStickData(data)) {
					return data
				} else {
					throw new Error('Invalid data format for candlestick chart')
				}
			} else if (type === 'area') {
				if (this.validateLineChartData(data)) {
					return data
				} else {
					throw new Error('Invalid data format for area chart')
				}
			} else {
				throw new Error('Unknown chart type')
			}
		}
	}

	validateCandleStickData(data) {
		return data.every(({ time, open, high, low, close }) => {
			const allIsNull = [open, high, low, close].every(p => p === null)
			const allIsNumbers = [open, high, low, close].every(
				p => typeof p === 'number' && !isNaN(p)
			)

			return time && (allIsNull || allIsNumbers)
		})
	}

	validateLineChartData(data) {
		return data.every(
			({ time, value }) =>
				time && ((typeof value === 'number' && !isNaN(value)) || value === null)
		)
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
