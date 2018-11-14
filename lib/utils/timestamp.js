const moment = require('moment');
const {config} = require('../../config');
const timestampOff = require('../constants/timestamp').none;

module.exports = {
	/**
	 * Formats the timestamp for logging purposes
	 * @param {Date} date - date to format, defaults to current date.
	 * @returns {string}
	 */
	format: date => {
		const currentTimestamp = config.timestamp;

		if (currentTimestamp === timestampOff)
			return '';

		return moment(date).format(currentTimestamp);
	},
};
