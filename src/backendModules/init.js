import { ipcMain as _ipcMain } from 'electron'
import { DataFetcher as _DataFetcher } from './DataFetcher'
import _Flipper from '../models/strategies/Flipper'

export const createInitApp = ({
	ipcMain = _ipcMain,
	DataFetcher = _DataFetcher,
	Flipper = _Flipper
} = {}) => {
	const initApp = () => {
		ipcMain.on('single-stock', async (event, { id }) => {
			const dataFetcher = new DataFetcher({ API_URL: 'http://localhost:4000/graphql?' })
			const resp = await dataFetcher.fetchStock({ id })
			event.reply('single-stock-response', resp)
		})

		ipcMain.on('all-stocks-summary', async (event, arg) => {
			const dataFetcher = new DataFetcher({ API_URL: 'http://localhost:4000/graphql?' })
			const resp = await dataFetcher.fetchSummary({})
			event.reply('all-stocks-summary-response', resp)
		})

		ipcMain.on('test-strategy', async (event, arg) => {
			const flipper = new Flipper()
			const resp = flipper.test()
			event.reply('test-strategy', resp)
		})
	}
	return initApp
}
