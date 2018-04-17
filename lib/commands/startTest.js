/**
 * Start test command.
 * This command allows user to define that all following commands must be recorded as new test.
 * Only relevant for automated test runs.
 */

const webSockets = require('../api/webSockets');
const wsContentTypes = require('../api/wsContentTypes');
const {validate, validators} = require('../validataion');
const {authContext, testContext} = require('../context');
const chainPromise = require('../utils/chainPromise');
const {invalidInputMessage} = require('../texts');

/**
 * Start automated session test, stop previous test, set test context.
 * @param {string} name - name of the test, must be unique per test pack
 * @param {Object} data - additional data
 * @param {string} data.clientTestId - user-defined id of the test, must be unique per test pack
 * @param {string} data.description - arbitrary description of the test
 * @param {string} data.appVersion - version of the application in test
 * @param {string} data.commitHash - other way to define version in test
 * @returns {ChainablePromise.<void>}
 */
async function startTest(name, data) {
	const content = {
		...data,
		name,
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

	testContext.clear();
	testContext.setContext(content);
}

module.exports = chainPromise(startTest);
