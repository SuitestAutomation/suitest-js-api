/**
 * http request module
 */

const fetch = require('node-fetch');

const {apiUrl} = require('../../config');
const SuitestError = require('../utils/SuitestError');
const makeUrlFromArray = require('../utils/makeUrlFromArray');
const {suitestServerError} = require('../texts');
const {captureException} = require('../utils/sentry/Raven');

/**
 * Make http request
 *
 * @param {string|[string, any]} url
 * @param {Object|any} requestObject
 * @param {Function} onReject - will be invoked if response not ok
 * @returns {Promise}
 */
async function request(url, requestObject, onReject) {
	if (requestObject.body) {
		requestObject.body = JSON.stringify(requestObject.body);

		if (!requestObject.headers) {
			requestObject.headers = {};
		}

		if (!requestObject.headers['Content-Type']) {
			requestObject.headers['Content-Type'] = 'application/json';
		}
	}

	let res;

	try {
		res = await fetch(apiUrl + makeUrlFromArray(url), requestObject);
	} catch (e) {
		// Caught low-level network error, i.e. not HTTP error
		// Report it to Sentry
		await captureException(e, {extra:{networkingError: true}});

		throw e;
	}

	if (res.ok) {
		return res.json();
	}

	if (onReject) {
		return Promise.reject(onReject(res));
	}

	throw new SuitestError(
		suitestServerError(request.name, res.status, res.statusText),
		SuitestError.SERVER_ERROR,
	);
}

module.exports = request;
