import { ipcMain } from 'electron'

export const initApp = () => {
	ipcMain.on('asynchronous-message', (event, arg) => {
		console.log(arg) // prints "ping"
		event.reply('asynchronous-reply', {
			title: 'sttelkdas',
			price: [1, 2, 34, 5, 6, 34, 2, 32, 2, 13, 21, 3]
		})
	})
}
