import _low from 'lowdb'
import _FileAsync from 'lowdb/adapters/FileAsync'

const createDBWrapper = async ({ low = _low, FileAsync = _FileAsync } = {}) => {
	const adapter = new FileAsync('db.json')
	const db = await low(adapter)
	return db
}

/**
 * Function to abstract out the db connection.
 * Can add dbFunctions that takes the db as single parameter to add more complex queries.
 *
 * Example:
 * ```javascript
 * const t = await DBWrapper.getDocument({
 * 	documentName: 'trades',
 * 	dbFunctions: [
 * 		x => x.map(({ resultPercent }) => resultPercent)
 * 		// ... more functions here if needed
 * 	]
 * })
 * ```
 * @param {Object} params
 * @param {string} params.documentName Name of the "document" in local db
 * @param {Array<Function>} params.dbFunctions Array of functions that has the db instance as only argument to make more complex queries.
 * @returns {Array<Object>|Object} The db response
 */
const getDocument = async ({ documentName, dbFunctions = [], DBWrapper = createDBWrapper }) => {
	const db = await DBWrapper()

	// Start the chain for fetching doc
	let dbChain = db.get(documentName)

	// Loop over the functions to customize the result
	dbFunctions.forEach(func => {
		dbChain = func(dbChain)
	})

	const data = await dbChain.value()
	return data
}

export default { getDocument }
