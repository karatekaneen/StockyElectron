import { ipcMain as _ipcMain } from 'electron'
import { DataFetcher as _DataFetcher } from './DataFetcher'

export const createInitApp = (ipcMain = _ipcMain, DataFetcher = _DataFetcher) => {
	const initApp = () => {
		const dataFetcher = new DataFetcher({ API_URL: 'http://localhost:4000/graphql?' })

		ipcMain.on('single-stock', async (event, { id }) => {
			const resp = await dataFetcher.fetchStock({ id })
			event.reply('single-stock-response', resp)
		})

		ipcMain.on('all-stocks-summary', async (event, arg) => {
			const resp = await dataFetcher.fetchSummary({})
			event.reply('all-stocks-summary-response', resp)
		})
	}
	return initApp
}
