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

	it('Should take array of DataSeries as props', () => {
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

		expect(wrapper.vm.seriesToDisplay).toEqual([{ chart: 'test' }, { data: 42 }])
		expect(createChartSeries).toHaveBeenCalledTimes(1)
		expect(createChartSeries).toHaveBeenLastCalledWith([{ chart: 'test' }, { data: 42 }])
	})

	it.todo('should add charts when propsdata change')
	it.todo('Should validate DataSeries on change')
	it.todo('Should watch props for changes')
	it.todo('Should remove items from chart when removed from props')
	it.todo('should be able to add more items after mount')
})
