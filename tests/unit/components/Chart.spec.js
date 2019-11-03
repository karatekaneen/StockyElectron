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
	it.todo('should test removeSeries')
	it.todo('should test createChartSeries')
	it.todo('should add charts when propsdata change')
	it.todo('Should validate DataSeries on change')
	it.todo('Should watch props for changes')
	it.todo('Should remove items from chart when removed from props')
})
