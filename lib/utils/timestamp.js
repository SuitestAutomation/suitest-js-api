const moment = require('moment');
const {config} = require('../../config');
const timestampOff = require('../constants/timestamp').none;

/**
 * Formats the timestamp for logging purposes
 * @{Date} date - date to format, defaults to current date.
 * @returns {string}
 */
module.exports = function timestamp(date = undefined) {
	const currentTimestamp = config.timestamp;

	if (currentTimestamp === timestampOff)
		return '';

	return moment(date).format(currentTimestamp);
};
