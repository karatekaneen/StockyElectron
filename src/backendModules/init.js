import { ipcMain as _ipcMain } from 'electron'
import { DataFetcher as _DataFetcher } from './DataFetcher'

export const createInitApp = (ipcMain = _ipcMain, DataFetcher = _DataFetcher) => {
	const initApp = () => {
		const dataFetcher = new DataFetcher({ API_URL: 'http://localhost:4000/graphql?' })

		ipcMain.on('asynchronous-message', async (event, { id }) => {
			const resp = await dataFetcher.fetchStock({ id })
			event.reply('asynchronous-reply', resp)
		})
	}
	return initApp
}
