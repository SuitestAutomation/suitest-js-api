/**
 * End test command.
 * This command explicitly closes current test.
 * Can be omitted, in that case test will be closed implicitly with following startTest call or when session ends.
 */

const wsContentTypes = require('../api/wsContentTypes');
const chainPromise = require('../utils/chainPromise');
const {commandExecuted, commandWillBeExecuted} = require('../texts');

/**
 * End automated session test, clear test context.
 * @param {Object} instance of main class
 * @returns {ChainablePromise.<void>}
 */
async function endTest({webSockets, authContext, testContext, logger}) {
	logger.delayed(commandWillBeExecuted('endTest'));
	// authorize
	const authedContent = await authContext.authorizeWs({type: wsContentTypes.endTest}, endTest.name);

	// make ws request
	await webSockets.send(authedContent);

	testContext.clear();
	logger.log(commandExecuted('endTest'));
}

module.exports = chainPromise(endTest);
