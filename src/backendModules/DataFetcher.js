import _axios from 'axios'
import Stock from '../models/Stock'
import _fs from 'fs'

class DataFetcher {
	constructor({
		axios = _axios,
		API_URL = 'http://localhost:4000/graphql?', // TODO Make API_URL an env-variable
		fs = _fs.promises
	} = {}) {
		this.API_URL = API_URL
		this.axios = axios
		this.fs = fs
	}

	/**
	 * Fetches single stock and the data specified
	 * @param {object} params
	 * @param {string} params.id id of the stock to fetch
	 * @param {string} params.fieldString The graphQL query string
	 * @returns {Stock} The data as an instance of Stock
	 */
	async fetchStock({
		id,
		fieldString = 'id, name, list, priceData{open, high, low, close, date}'
	} = {}) {
		const query = `{stock( id: ${id}) {${fieldString}}}`
		const { data } = await this.axios.post(this.API_URL, { query })
		const stock = new Stock({ data: data.data.stock })

		return stock
	}

	async fetchSummary({ fieldString = 'id, name, list' }) {
		// TODO Should use summary doc instead of all the single stock docs
		const query = `
		{
			stocks{
				${fieldString}
			}
		}`
		const { data } = await this.axios.post(this.API_URL, { query })
		return data.data.stocks
	}

	// TODO Add pagination etc to limit trafic to API. consumes A LOT of memory
	async fetchStocks({
		fieldString = 'id, name, list, priceData{open, high, low, close, date}'
	} = {}) {
		const query = `
		{
			stocks(type: "stock"){
				${fieldString}
			}
		}`
		const { data } = await this.axios.post(this.API_URL, { query })
		return data.data.stocks.map(stock => new Stock({ data: stock }))
	}
}

export default DataFetcher
