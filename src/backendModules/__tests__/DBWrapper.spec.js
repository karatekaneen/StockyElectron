import DBWrapper from '../DBWrapper'

describe('DBWrapper', () => {
	describe('getDocument', () => {
		let DBWrapperMock
		beforeEach(() => {
			const value = jest.fn().mockResolvedValue({ data: 'cooool' })
			const get = jest.fn().mockReturnValue({ value })
			DBWrapperMock = jest.fn().mockResolvedValue({ get })
		})
		it('Works in vanilla case', async () => {
			const resp = await DBWrapper.getDocument({
				documentName: 'test',
				DBWrapper: DBWrapperMock
			})
			expect(resp).toEqual({ data: 'cooool' })
		})
	})
})
