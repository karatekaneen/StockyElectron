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

	it.todo('Should take array of DataSeries as props')
	it.todo('Should validate DataSeries on change')
	it.todo('Should watch props for changes')
	it.todo('Should remove items from chart when removed from props')
	it.todo('should be able to add more items after mount')
})
