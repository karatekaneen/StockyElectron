import { ipcMain as _ipcMain } from 'electron'
import { DataFetcher as _DataFetcher } from './DataFetcher'
import _Flipper from '../models/strategies/Flipper'
import stock from '../../teststock.json'

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
			stock.priceData = stock.priceData.map(d => {
				d.date = new Date(d.date)
				return d
			})
			const { signals, context, pendingSignal, trades, openTrade } = flipper.test({ stock })
			const log = trades.forEach(({ resultPerStock, resultPercent, tradeData }) => {
				console.log({ resultPerStock, resultPercent, tradeData: tradeData.length })
			})

			console.log(signals)
			const avg =
				trades.reduce((acc, current) => (acc += current.resultPercent), 0) / trades.length
			console.log({ avg, number: trades.length })

			event.reply('test-strategy', { signals, context })
		})
	}
	return initApp
}
