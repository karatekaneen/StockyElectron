import { ipcMain as _ipcMain } from 'electron'
import _DataFetcher from './DataFetcher'
import _Flipper from '../models/strategies/Flipper'
// import _PouchDB from 'pouchdb'
import _low from 'lowdb'
import _FileAsync from 'lowdb/adapters/FileAsync'
import _DBWrapper from './DBWrapper'
import TradeAnalyzer from './TradeAnalyzer'
import _Portfolio from '../models/Portfolio'

export const createInitApp = ({
	ipcMain = _ipcMain,
	DataFetcher = _DataFetcher,
	Flipper = _Flipper,
	low = _low,
	FileAsync = _FileAsync,
	DBWrapper = _DBWrapper,
	Portfolio = _Portfolio
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

			const pending = await DBWrapper.getDocument({
				documentName: 'pendingSignal',
				dbFunctions: [
					arr =>
						arr.filter(
							x =>
								Boolean(x) &&
								(x.stock.list === 'Large Cap Stockholm' ||
									x.stock.list === 'Mid Cap Stockholm')
						)
				]
			})

			console.log(JSON.stringify(pending, null, 2))

			const s = await DBWrapper.getDocument({
				documentName: 'signals',
				dbFunctions: [
					arr =>
						arr.filter(
							x =>
								x.stock.list === 'Large Cap Stockholm' ||
								x.stock.list === 'Mid Cap Stockholm'
						),
					arr =>
						arr.sortBy(x => {
							const d = new Date(x.date)
							return -d
						}),
					arr => arr.take(100)
				]
			})

			event.reply('get-signals', s)
		})

		ipcMain.on('portfolio-test', async (event, arg) => {
			const adapter = new FileAsync('db.json')
			const db = await low(adapter)
			const trades = await db
				.get('trades')
				.filter(
					x => x.stock.list === 'Large Cap Stockholm' || x.stock.list === 'Mid Cap Stockholm'
				)
				.value()
			const p = new Portfolio({ startCapital: 1000000, feeMinimum: 69, feePercentage: 0.00069 })
			const p2 = new Portfolio({ startCapital: 1000000, feeMinimum: 69, feePercentage: 0.00069 })
			console.log('**** random ****')
			await p.backtest({ trades })
			console.log({
				signalsNotTaken: p.signalsNotTaken,
				startCapital: p.startCapital,
				cashAvailable: p.cashAvailable
			})

			await p2.backtest({ trades: trades.filter(x => x.stock.list === 'Large Cap Stockholm') })
			console.log({
				signalsNotTaken: p2.signalsNotTaken,
				startCapital: p2.startCapital,
				cashAvailable: p2.cashAvailable
			})

			const temp = []
			p.timeline.forEach((value, key) => {
				const rawDate = new Date(key)

				const pad = num => (num < 10 ? num.toString().padStart(2, '0') : num.toString())

				const month = pad(rawDate.getMonth() + 1)
				const date = pad(rawDate.getDate())
				temp.push({ time: `${rawDate.getFullYear()}-${month}-${date}`, value: value.total })
			})

			const temp2 = []
			p2.timeline.forEach((value, key) => {
				const rawDate = new Date(key)

				const pad = num => (num < 10 ? num.toString().padStart(2, '0') : num.toString())

				const month = pad(rawDate.getMonth() + 1)
				const date = pad(rawDate.getDate())
				temp2.push({ time: `${rawDate.getFullYear()}-${month}-${date}`, value: value.total })
			})
			console.log('p', TradeAnalyzer.analyze(p.historicalTrades.map(t => t.resultInCash)))
			console.log('p2', TradeAnalyzer.analyze(p2.historicalTrades.map(t => t.resultInCash)))

			event.reply('portfolio-test', [
				temp.slice(0, temp.length - 1),
				temp2.slice(0, temp2.length - 1)
			])
		})

		ipcMain.on('test-all-stocks', async (event, arg) => {
			try {
				const flipper = new Flipper()
				const dataFetcher = new DataFetcher({ API_URL: 'http://localhost:4000/graphql?' })
				const adapter = new FileAsync('db.json')
				const db = await low(adapter)
				await db.defaults({ signals: [], trades: [], pendingSignal: [], context: [] }).write()

				console.info('Starting data fetching')
				const resp = await dataFetcher.fetchStocks({ fieldString: 'id, name, list' })
				console.info('Data downloaded', resp.length)

				for (let i = 0; i < resp.length; i++) {
					console.info('Starting tests', i)
					// eslint-disable-next-line no-await-in-loop
					const { trades, pendingSignal, signals, context } = await flipper.test({
						stock: resp[i]
					})

					console.log('Starting write', i)
					// eslint-disable-next-line no-await-in-loop
					await db
						.get('pendingSignal')
						.push(pendingSignal)
						.write()
					// // eslint-disable-next-line no-await-in-loop
					// await db
					// 	.get('signals')
					// 	.push(...signals)
					// 	.write()
					// // eslint-disable-next-line no-await-in-loop
					// await db
					// 	.get('trades')
					// 	.push(...trades)
					// 	.write()

					// eslint-disable-next-line no-await-in-loop
					await db
						.get('context')
						.push(context)
						.write()

					console.log('Finished write', i)
				}

				const s = await db
					.get('pendingSignal')
					.filter(Boolean)
					.value()
				const x = await db
					.get('signals')
					.filter(Boolean)
					.sortBy(x => {
						const d = new Date(x.date)
						return -d
					})
					.take(50)
					.value()

				s.forEach(sig => {
					console.log(sig.stock.name, sig.action)
				})

				event.reply('test-all-stocks', { s, x })
			} catch (err) {
				console.log(err)
			}
		})
	}
	return initApp
}
