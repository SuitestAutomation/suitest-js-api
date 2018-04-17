/**
 * End test command.
 * This command explicitly closes current test.
 * Can be omitted, in that case test will be closed implicitly with following startTest call or when session ends.
 */

const webSockets = require('../api/webSockets');
const wsContentTypes = require('../api/wsContentTypes');
const {authContext, testContext} = require('../context');
const chainPromise = require('../utils/chainPromise');

/**
 * End automated session test, clear test context.
 * @returns {ChainablePromise.<void>}
 */
async function endTest() {
	// authorize
	const authedContent = await authContext.authorizeWs({type: wsContentTypes.endTest}, endTest.name);

	// make ws request
	await webSockets.send(authedContent);

	testContext.clear();
}

module.exports = chainPromise(endTest);
