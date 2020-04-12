/**
 * Start test command.
 * This command allows user to define that all following commands must be recorded as new test.
 * Only relevant for automated test runs.
 */

const wsContentTypes = require('../api/wsContentTypes');
const {validate, validators} = require('../validation');
const chainPromise = require('../utils/chainPromise');
const {invalidInputMessage, testWasStarted, testWillBeStarted} = require('../texts');
const logger = require('../utils/logger');

/**
 * Start test
 * @param {Object} instance of main class
 * @param {string} clientTestId - user-defined id of the test, must be unique per test pack
 * @param {string} [name] - human readable name of the test, optional.
 * @param {string} [description] - arbitrary description of the test
 * @throws {SuitestError} - when context of the test run is wrong
 * @returns {ChainablePromise.<void>}
 */
async function startTest({webSockets, authContext, testContext}, clientTestId, {name, description} = {}) {
	console.log('start test --- --');
	logger.info(testWillBeStarted(name || clientTestId));

	const content = {
		clientTestId,
		name,
		description,
	};

	// validate content json
	validate(validators.START_TEST, content, invalidInputMessage(startTest.name, 'Start test data'));

	// authorize
	const authedContent = await authContext.authorizeWs({
		...content,
		type: wsContentTypes.startTest,
	}, startTest.name);

	// make ws request
	await webSockets.send(authedContent);
	console.log('msg sent');

	testContext.clear();
	testContext.setContext(content);
	logger.info(testWasStarted(name || clientTestId));
}

module.exports = chainPromise(startTest);
