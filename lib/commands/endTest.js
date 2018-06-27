/**
 * End test command.
 * This command explicitly closes current test.
 * Can be omitted, in that case test will be closed implicitly with following startTest call or when session ends.
 */

const webSockets = require('../api/webSockets');
const wsContentTypes = require('../api/wsContentTypes');
const {authContext, testContext} = require('../context');
const chainPromise = require('../utils/chainPromise');
const {commandExecuted, commandWillBeExecuted} = require('../texts');
const logger = require('../utils/logger');
const {stackTraceWrapper} = require('../utils/stackTraceParser');

/**
 * End automated session test, clear test context.
 * @returns {ChainablePromise.<void>}
 */
async function endTest() {
	logger.info(commandWillBeExecuted('endTest'));
	// authorize
	const authedContent = await authContext.authorizeWs({type: wsContentTypes.endTest}, endTest.name);

	// make ws request
	await webSockets.send(authedContent);

	testContext.clear();
	logger.info(commandExecuted('endTest'));
}

module.exports = chainPromise(stackTraceWrapper(endTest));
