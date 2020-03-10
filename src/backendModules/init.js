import { ipcMain as _ipcMain } from 'electron'
import { DataFetcher as _DataFetcher } from './DataFetcher'
import _Flipper from '../models/strategies/Flipper'
// import _PouchDB from 'pouchdb'
import _low from 'lowdb'
import _FileAsync from 'lowdb/adapters/FileAsync'
import _DBWrapper from './DBWrapper'
import TradeAnalyzer from './TradeAnalyzer'

export const createInitApp = ({
	ipcMain = _ipcMain,
	DataFetcher = _DataFetcher,
	Flipper = _Flipper,
	low = _low,
	FileAsync = _FileAsync,
	DBWrapper = _DBWrapper
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

		ipcMain.on('test-strategy', async (event, { id }) => {
			const flipper = new Flipper()
			const dataFetcher = new DataFetcher({ API_URL: 'http://localhost:4000/graphql?' })
			const resp = await dataFetcher.fetchStock({ id })

			const { signals, context, pendingSignal, trades, openTrade } = flipper.test({
				stock: resp
			})
			const log = trades.map(({ resultPerStock, resultPercent, tradeData }) => {
				return { resultPerStock, resultPercent, tradeData: tradeData.length }
			})

			console.log(log)

			const avg =
				trades.reduce((acc, current) => (acc += current.resultPercent), 0) / trades.length
			console.log({ avg, number: trades.length })

			event.reply('test-strategy', { signals, context })
		})

		ipcMain.on('get-signals', async event => {
			const adapter = new FileAsync('db.json')
			const db = await low(adapter)

			const temp = await DBWrapper.getDocument({
				documentName: 'trades',
				dbFunctions: [x => x.map(({ resultPercent, stock }) => ({ resultPercent, stock }))]
			})

			const tradesByList = temp.reduce((aggregate, current) => {
				const list = aggregate[current.stock.list] || []
				list.push(current.resultPercent)
				aggregate[current.stock.list] = list
				return aggregate
			}, {})

			const statsByCategories = []

			Object.entries(tradesByList).forEach(([groupName, value]) => {
				statsByCategories.push({ groupName, ...TradeAnalyzer.analyze(value) })
			})

			console.log(JSON.stringify(statsByCategories, null, 2))

			const s = await db
				.get('signals')
				.sortBy(x => {
					const d = new Date(x.date)
					return -d
				})
				.take(100)
				.value()

			event.reply('get-signals', s)
		})

		ipcMain.on('test-all-stocks', async (event, arg) => {
			try {
				const flipper = new Flipper()
				const dataFetcher = new DataFetcher({ API_URL: 'http://localhost:4000/graphql?' })
				const adapter = new FileAsync('db.json')
				const db = await low(adapter)
				await db.defaults({ signals: [], trades: [] }).write()

				console.info('Starting data fetching')
				const resp = await dataFetcher.fetchStocks()
				console.info('Data downloaded')

				for (let i = 0; i < resp.length; i++) {
					console.info('Starting tests', i)
					const { trades } = flipper.test({
						stock: resp[i]
					})

					console.log('Starting write', i)
					// eslint-disable-next-line no-await-in-loop
					const signalPromises = await db
						.get('trades')
						.push(...trades)
						.write()

					console.log('Finished write', i)
				}
				// const testResults = resp.map(stock => {
				// const { signals, context, pendingSignal, trades, openTrade } = flipper.test({
				// 	stock
				// })

				// const avg =
				// trades.reduce((acc, current) => (acc += current.resultPercent), 0) / trades.length
				// console.log({ avg, number: trades.length })

				// return { signalPromises }
				// })
				// await Promise.all(testResults)

				const s = await db
					.get('signals')
					.sortBy(x => {
						const d = new Date(x.date)
						return -d
					})
					.take(5)
					.value()

				event.reply('test-all-stocks', s)
			} catch (err) {
				console.log(err)
			}
		})
	}
	return initApp
}
