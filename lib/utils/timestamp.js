const moment = require('moment');
const {config} = require('../../config');
const timestampOff = require('../constants/timestamp').none;

/**
 * Formats date.
 * @param {string} format - format string
 * @param {Date} [date] - date to format, defaults to current date.
 * @returns {string} - if format is timestampOff, returns empty string
 */
const format = format => date => {
	if (format === timestampOff)
		return '';

	return moment(date).format(format);
};

/**
 * Formats the date depending on timestamp in config.
 * For logging purposes.
 * @returns {string}
 * @param timestamp
 */
const formatDate = (timestamp) => format(timestamp);

module.exports = {
	format,
	formatDate,
};
