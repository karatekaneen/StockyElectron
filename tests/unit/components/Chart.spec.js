import { shallowMount, createLocalVue } from '@vue/test-utils'
import Chart from '../../../src/components/Chart'
// import Vue from 'vue'
import Vuetify from 'vuetify'

const localVue = createLocalVue()

localVue.use(Vuetify)
document.body.setAttribute('data-app', true)

describe('Chart', () => {
	it('Creates chart on mount', () => {
		const mockCreateChartInstance = jest.fn(() => ({ chart: 'data' }))
		const wrapper = shallowMount(Chart, {
			methods: {
				createChartInstance: mockCreateChartInstance
			},
			localVue
		})

		expect(mockCreateChartInstance).toHaveBeenCalledTimes(1)
	})

	it('Should watch props for changes', () => {
		expect.assertions(2)

		const createChartInstance = jest.fn(() => ({ chart: 'data' }))
		const createChartSeries = jest.fn()
		const wrapper = shallowMount(Chart, {
			methods: {
				createChartInstance,
				createChartSeries
			},
			propsData: {
				chartData: [{ chart: 'test' }, { data: 42 }]
			},
			localVue
		})

		wrapper.setProps({ chartData: [{ new: 42 }, { candlestick: 24 }] })
		expect(createChartSeries.mock.calls[0][0]).toEqual([{ new: 42 }, { candlestick: 24 }])
		jest.clearAllMocks()

		wrapper.setProps({ chartData: [{ newAgain: 54 }, { lineChart: 'wooop' }] })
		expect(createChartSeries.mock.calls[0][0]).toEqual([{ newAgain: 54 }, { lineChart: 'wooop' }])
		jest.clearAllMocks()
	})

	describe('RemoveSeries', () => {
		it('calls removeSeries on chartObj for every series', () => {
			expect.assertions(4)

			const removeSeries = jest.fn()
			const createChartInstance = jest.fn(() => ({ chart: 'data' }))
			const createChartSeries = jest.fn()
			const wrapper = shallowMount(Chart, {
				localVue,
				methods: {
					createChartInstance,
					createChartSeries
				},
				propsData: {
					chartData: [{ chart: 'test' }, { data: 42 }]
				}
			})

			wrapper.vm.seriesToDisplay = [
				{ name: 'existing', chartDataSeries: { chart: 'yes' } },
				{ name: 'toRemove', chartDataSeries: { chart: 'shouldBeremoved' } }
			]
			wrapper.vm.chart = { removeSeries }

			wrapper.vm.removeSeries([
				{ name: 'toRemove', chartDataSeries: { chart: 'shouldBeremoved' } }
			])

			expect(wrapper.vm.seriesToDisplay.length).toBe(1)
			expect(wrapper.vm.seriesToDisplay[0]).toEqual({
				name: 'existing',
				chartDataSeries: { chart: 'yes' }
			})
			expect(removeSeries).toHaveBeenCalledTimes(1)
			expect(removeSeries).toHaveBeenCalledWith({ chart: 'shouldBeremoved' })
		})

		it('throws when passed empty array', () => {
			expect.assertions(1)

			const removeSeries = jest.fn()
			const createChartInstance = jest.fn(() => ({ chart: 'data' }))
			const createChartSeries = jest.fn()
			const wrapper = shallowMount(Chart, {
				localVue,
				methods: {
					createChartInstance,
					createChartSeries
				},
				propsData: {
					chartData: [{ chart: 'test' }, { data: 42 }]
				}
			})

			wrapper.vm.seriesToDisplay = [
				{ name: 'existing', chartDataSeries: { chart: 'yes' } },
				{ name: 'toRemove', chartDataSeries: { chart: 'shouldBeremoved' } }
			]
			wrapper.vm.chart = { removeSeries }

			try {
				wrapper.vm.removeSeries([])
			} catch (err) {
				expect(err.message).toBe('unwantedSeries can not be empty')
			}
		})

		it('throws when seriesToDisplay is empty', () => {
			expect.assertions(1)

			const removeSeries = jest.fn()
			const createChartInstance = jest.fn(() => ({ chart: 'data' }))
			const createChartSeries = jest.fn()
			const wrapper = shallowMount(Chart, {
				localVue,
				methods: {
					createChartInstance,
					createChartSeries
				},
				propsData: {
					chartData: [{ chart: 'test' }, { data: 42 }]
				}
			})

			wrapper.vm.seriesToDisplay = []
			wrapper.vm.chart = { removeSeries }

			try {
				wrapper.vm.removeSeries([{ chart: 'test' }, { data: 42 }])
			} catch (err) {
				expect(err.message).toBe(
					'seriesToDisplay can not be empty before removal - There is a bug somewhere'
				)
			}
		})
	})

	describe('createChartSeries', () => {
		it('loops over each series and adds them by type', () => {
			expect.assertions(6)

			const setData = jest.fn()
			const addLineSeries = jest.fn(() => ({ setData }))
			const addCandlestickSeries = jest.fn(() => ({ setData }))
			const createChartInstance = jest.fn(() => ({ chart: 'data' }))
			const wrapper = shallowMount(Chart, {
				localVue,
				methods: {
					createChartInstance
				},
				propsData: {
					chartData: [{ chart: 'test' }, { data: 42 }]
				}
			})

			wrapper.vm.chart = { addCandlestickSeries, addLineSeries }

			wrapper.vm.createChartSeries([
				{
					name: 'candlesToAdd',
					type: 'candlestick',
					data: [{ time: 2, open: 42, high: 60, low: 39, close: 52 }]
				},
				{ name: 'lineToAdd', type: 'line', data: [{ time: 2, value: 42 }] }
			])

			expect(wrapper.vm.seriesToDisplay.length).toBe(2)
			expect(addCandlestickSeries).toHaveBeenCalledTimes(1)
			expect(addLineSeries).toHaveBeenCalledTimes(1)
			expect(setData).toHaveBeenCalledTimes(2)
			expect(setData.mock.calls[0][0]).toEqual([
				{ close: 52, high: 60, low: 39, open: 42, time: 2 }
			])
			expect(setData.mock.calls[1][0]).toEqual([{ time: 2, value: 42 }])
		})

		it('throws when encountering unknown chart type', () => {
			expect.assertions(5)

			const setData = jest.fn()
			const addLineSeries = jest.fn(() => ({ setData }))
			const addCandlestickSeries = jest.fn(() => ({ setData }))
			const createChartInstance = jest.fn(() => ({ chart: 'data' }))
			const wrapper = shallowMount(Chart, {
				localVue,
				methods: {
					createChartInstance
				},
				propsData: {
					chartData: [{ chart: 'test' }, { data: 42 }]
				}
			})

			wrapper.vm.chart = { addCandlestickSeries, addLineSeries }

			try {
				wrapper.vm.createChartSeries([
					{
						name: 'shouldFail',
						type: 'unicorn',
						data: [{ time: 2, open: 42, high: 60, low: 39, close: 52 }]
					}
				])
			} catch (err) {
				expect(wrapper.vm.seriesToDisplay.length).toBe(0)
				expect(addCandlestickSeries).toHaveBeenCalledTimes(0)
				expect(addLineSeries).toHaveBeenCalledTimes(0)
				expect(setData).toHaveBeenCalledTimes(0)
				expect(err.message).toBe('Unknown chart type: unicorn')
			}
		})

		it.todo('should handle area charts')
		it.todo('should handle histogram charts')
	})
	it.todo('should have options')
	it.todo('should have legend)')
})
