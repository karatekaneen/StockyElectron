import { shallowMount } from '@vue/test-utils'
import Chart from '../../../src/components/Chart'
import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)
document.body.setAttribute('data-app', true)

describe('Chart', () => {
	it('Creates chart on mount', () => {
		const mockCreateChartInstance = jest.fn(() => ({ chart: 'data' }))
		const wrapper = shallowMount(Chart, {
			methods: {
				createChartInstance: mockCreateChartInstance
			}
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
			}
		})

		// It is bad practice to override props like this but it is the simplest way to test watchers on propsData
		wrapper.vm.chartData = [{ new: 42 }, { candlestick: 24 }]
		expect(createChartSeries.mock.calls[0][0]).toEqual([{ new: 42 }, { candlestick: 24 }])
		jest.clearAllMocks()

		wrapper.vm.chartData = [{ newAgain: 54 }, { lineChart: 'wooop' }]
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
	it.todo('should test createChartSeries')
	it.todo('should have options')
})
