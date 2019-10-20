import { ipcMain as _ipcMain } from 'electron'
import _axios from 'axios'

export const createInitApp = (ipcMain = _ipcMain, axios = _axios) => {
	const initApp = () => {
		ipcMain.on('asynchronous-message', async (event, { id }) => {
			const query = `{stock( id: ${id}) {id, name, list, priceData{open, high, low, close, date}}}`
			const { data } = await axios.post('http://localhost:4000/graphql?', { query })
			event.reply('asynchronous-reply', data.data.stock)
		})
	}
	return initApp
}
