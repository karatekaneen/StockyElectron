import _axios from 'axios'
import Stock from '../models/Stock'

export class DataFetcher {
	constructor({ axios = _axios, API_URL }) {
		this.API_URL = API_URL
		this.axios = axios
	}

	async fetchStock({
		id,
		fieldString = 'id, name, list, priceData{open, high, low, close, date'
	}) {
		const query = `{stock( id: ${id}) {${fieldString}}}}`
		const { data } = await this.axios.post(this.API_URL, { query })
		console.log(data)
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
		console.log(data)
		return data.data.stocks
	}
}
