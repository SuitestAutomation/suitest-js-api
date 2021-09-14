/* istanbul ignore file */

const mock = require('mock-require');
const testLauncherHelper = require('../testLauncherHelper');

// TODO: remove (investigate)?
mock('../testLauncherHelper', {
	...testLauncherHelper,
});
