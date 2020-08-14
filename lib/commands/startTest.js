/**
 * Start test command.
 * This command allows user to define that all following commands must be recorded as new test.
 * Only relevant for automated test runs.
 */

const util = require('util');
const wsContentTypes = require('../api/wsContentTypes');
const {validate, validators} = require('../validation');
const chainPromise = require('../utils/chainPromise');
const {testWasStarted, testWillBeStarted, startTestDeprecate} = require('../texts');

/**
 * Start test
 * @info using .startTest with arguments is deprecated
 * @param {Object} instance of main class
 * @param {string} clientTestId - user-defined id of the test, must be unique per test pack
 * @param {string} [name] - human readable name of the test, optional.
 * @param {string} [description] - arbitrary description of the test
 * @throws {SuitestError} - when context of the test run is wrong
 * @returns {ChainablePromise.<void>}
 */
async function startTest({webSockets, authContext, testContext, logger}, clientTestId, {name, description} = {}) {
	logger.info(testWillBeStarted(name || clientTestId));

	const content = {
		clientTestId,
		name,
		description,
	};

	// authorize
	const authedContent = await authContext.authorizeWs({
		type: wsContentTypes.startTest,
	}, startTest.name);

	// make ws request
	await webSockets.send(authedContent);

	testContext.clear();
	testContext.setContext(content);
	logger.info(testWasStarted(name || clientTestId));
}
const deprecateStartTest = util.deprecate(startTest, startTestDeprecate());

function startTestWrapper(...args) {
	if (args.length) {
		return deprecateStartTest(...args);
	}

	return startTest(...args);
}

module.exports = chainPromise(startTestWrapper);
