/* istanbul ignore file */

const sinon = require('sinon');
const mock = require('mock-require');
const testLauncherHelper = require('../testLauncherHelper');

mock('../testLauncherHelper', {
	...testLauncherHelper,
	promptPassword: sinon.stub().resolves('password'),
});
