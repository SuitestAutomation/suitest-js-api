/**
 * During an interactive test execution there are often periods of time
 * where longer waits occur and it is not immediately obvious why it is so.
 * In this case server sends WS events with content type 'progress'.
 * Description is printed to stdout.
 */

const {translateProgress} = require('../utils/translateResults');
const Raven = require('raven');

/**
 * Print progress description to stdout
 * @param logger
 * @param {{status, code}} res
 */
function handleProgress(logger, res) {
	try {
		const msg = translateProgress(res);

		if (msg) {
			logger.log(`  - ${msg}`);
		}
	} catch (error) {
		Raven.captureException(error);
	}
}

module.exports = {
	handleProgress,
};
