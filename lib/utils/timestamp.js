const moment = require('moment');
const {config} = require('../../config');
const timestampOff = require('../constants/timestamp').none;
const {curry} = require('ramda');

/**
 * Formats date.
 * @param {string} format - format string
 * @param {Date} [date] - date to format, defaults to current date.
 * @returns {string} - if format is timestampOff, returns empty string
 */
const format = curry((format, date) => {
	if (format === timestampOff)
		return '';

	return moment(date).format(format);
});

/**
 * Formats the date depending on timestamp in config.
 * For logging purposes.
 * @param {Date} date - date to format
 * @returns {string}
 */
const formatDate = format(config.timestamp);

module.exports = {
	format,
	formatDate,
};
