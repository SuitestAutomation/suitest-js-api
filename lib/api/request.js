/**
 * http request module
 */

const fetch = require('node-fetch');

const {config} = require('../../config');
const SuitestError = require('../utils/SuitestError');
const makeUrlFromArray = require('../utils/makeUrlFromArray');
const {suitestServerError} = require('../texts');

/**
 * Make http request
 *
 * @param {string|[string, any]} url
 * @param {Object|any} requestObject
 * @param {string} funcName - function name which will be called by user. Needed for proper error message displaying
 * @returns {Promise}
 */
function request(url, requestObject, funcName = '') {
	if (requestObject.body) {
		requestObject.body = JSON.stringify(requestObject.body);

		if (!requestObject.headers) {
			requestObject.headers = {};
		}

		if (!requestObject.headers['Content-Type']) {
			requestObject.headers['Content-Type'] = 'application/json';
		}
	}

	return fetch(config.apiUrl + makeUrlFromArray(url), requestObject)
		.then(res => {
			if (res.ok) {
				return Promise.resolve(res.json());
			}

			return Promise.reject(
				new SuitestError(
					suitestServerError(funcName, res.status, res.statusText),
					SuitestError.SERVER_ERROR
				)
			);
		});
}

module.exports = request;
