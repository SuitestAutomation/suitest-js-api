/**
 * During an interactive test execution there are often periods of time
 * where longer waits occur and it is not immediately obvious why it is so.
 * In this case server sends WS events with content type 'progress'.
 * Description is printed to stdout.
 */

const logger = require('../utils/logger');
const {translateProgress} = require('../utils/translateResults');

/**
 * Print progress description to stdout
 * @param {{status, code}} res
 */
function handleProgress(res) {
	const log = translateProgress(res);

	log && logger.log(`  - ${log}`);
}

module.exports = {
	handleProgress,
};
