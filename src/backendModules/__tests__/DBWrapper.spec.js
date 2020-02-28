import DBWrapper from '../DBWrapper'

describe('DBWrapper', () => {
	describe('getDocument', () => {
		// Exposing outside of beforeEach
		let DBWrapperMock
		let get
		let value
		beforeEach(() => {
			value = jest.fn().mockResolvedValue({ data: 'cooool' })
			get = jest.fn().mockReturnValue({ value })
			DBWrapperMock = jest.fn().mockResolvedValue({ get })
		})

		it('Works in vanilla case', async () => {
			const resp = await DBWrapper.getDocument({
				documentName: 'test',
				DBWrapper: DBWrapperMock
			})
			expect(resp).toEqual({ data: 'cooool' })
		})

		it('Calls the db functions on the db', async () => {
			const limit = jest.fn().mockReturnValue({ value })
			get.mockReturnValue({ limit })

			const resp = await DBWrapper.getDocument({
				documentName: 'test',
				DBWrapper: DBWrapperMock,
				dbFunctions: [x => x.limit(5)]
			})

			expect(limit).toHaveBeenCalledWith(5)
			expect(resp).toEqual({ data: 'cooool' })
		})

		it('Calls the db functions in order', async () => {
			const sort = jest.fn().mockReturnValue({ value })
			const limit = jest.fn().mockReturnValue({ sort, test: 42 })
			get.mockReturnValue({ limit })

			const resp = await DBWrapper.getDocument({
				documentName: 'test',
				DBWrapper: DBWrapperMock,
				dbFunctions: [x => x.limit(5), x => x.sort(x.test)]
			})

			expect(limit).toHaveBeenCalledWith(5)
			expect(sort).toHaveBeenCalledWith(42) // This would've been undefined if it wasn't in order.
		})
	})
})
