/**
 * Start test command.
 * This command allows user to define that all following commands must be recorded as new test.
 * Only relevant for automated test runs.
 */

const webSockets = require('../api/webSockets');
const wsContentTypes = require('../api/wsContentTypes');
const {validate, validators} = require('../validation');
const {authContext} = require('../context');
const chainPromise = require('../utils/chainPromise');
const {invalidInputMessage, testWasStarted, testWillBeStarted} = require('../texts');
const logger = require('../utils/logger');

/**
 * Start test
 * @throws {SuitestError} - when context of the test run is wrong
 * @returns {ChainablePromise.<void>}
 */
async function startTest() {
	logger.info(testWillBeStarted());

	// authorize
	const authedContent = await authContext.authorizeWs({
		type: wsContentTypes.startTest,
	}, startTest.name);

	// make ws request
	await webSockets.send(authedContent);

	logger.info(testWasStarted());
}

module.exports = chainPromise(startTest);
