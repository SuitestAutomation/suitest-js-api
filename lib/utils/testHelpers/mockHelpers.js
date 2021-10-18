/* istanbul ignore file */

const mock = require('mock-require');
const testLauncherHelper = require('../testLauncherHelper');

mock('../testLauncherHelper', {
	...testLauncherHelper,
});
