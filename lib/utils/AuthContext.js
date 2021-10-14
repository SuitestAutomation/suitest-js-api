/**
 * AuthContext class
 * Stores current auth context with all its data (tokens, header modifiers etc).
 * Exposes authorize method, which allows or disallows request based on current context, request key.
 */

const Context = require('./Context');
const sessionConstants = require('../constants/session');
const endpoints = require('../api/endpoints');
const wsContentTypes = require('../api/wsContentTypes');
const SuitestError = require('./SuitestError');
const texts = require('../texts');

/**
 * List of request keys and methods allowed by context
 */
const guestAllowed = {
	http: {},
	ws: [],
};

const tokenAllowed = {
	http: {
		[endpoints.apps]: ['GET'],
		[endpoints.appById]: ['GET'],
		[endpoints.appTags]: ['GET'],
		[endpoints.appConfigs]: ['GET'],
		[endpoints.appConfigById]: ['GET'],
		[endpoints.appTestDefinitions]: ['GET'],
		[endpoints.appTestDefinitionById]: ['GET'],
		[endpoints.devices]: ['GET'],
		[endpoints.testRun]: ['POST'],
		[endpoints.testRunById]: ['GET', 'DELETE'],
		[endpoints.testRunOnDevice]: ['DELETE'],
	},
	ws: [
		wsContentTypes.pairDevice, wsContentTypes.releaseDevice,
		wsContentTypes.selectConfiguration, wsContentTypes.query,
		wsContentTypes.eval, wsContentTypes.testLine,
		wsContentTypes.takeScreenshot,
	],
};

const allowedRequests = {
	http: {
		[sessionConstants.GUEST]: guestAllowed.http,
		[sessionConstants.TOKEN]: tokenAllowed.http,
	},
	ws: {
		[sessionConstants.GUEST]: guestAllowed.ws,
		[sessionConstants.TOKEN]: tokenAllowed.ws,
	},
};

/**
 * Decorate http requestObject with current context headers
 * @param {*} requestObject
 * @param {*} headers
 * @returns requestObject decoerated with auth headers
 */
function decorateRequestObject(requestObject, headers) {
	return Object.assign({}, requestObject, {headers});
}

/**
 * The complete SuitestErrorOptions, or one or more components of the Triforce.
 * @typedef {Object} SuitestErrorOptions
 * @property {string} [commandName].
 * @property {Symbol} [type].
 */

/**
 * @description get array of arguments for SuitestError constructor
 * @param {SuitestErrorOptions} errOptions
 */
function suitestErrorArguments(errOptions) {
	const message = errOptions.commandName ? texts.authNotAllowed(errOptions.commandName) : texts.authFailed();
	const type = errOptions.type ? errOptions.type : SuitestError.AUTH_NOT_ALLOWED;

	return [message, type];
}

class AuthContext extends Context {
	constructor() {
		super();

		this.headers = {};
		this.tokenId = '';
		this.tokenPassword = '';
		super.setContext(sessionConstants.GUEST);
	}

	/**
	 * Set context. Update headers based on new context.
	 *
	 * @param {Symbol} newContext context symbol constant
	 * @param {string|undefined} [tokenId]
	 * @param {string|undefined} [tokenPassword]
	 */
	setContext(newContext, tokenId, tokenPassword) {
		switch (newContext) {
			case sessionConstants.TOKEN:
				super.setContext(newContext);
				this.tokenId = tokenId;
				this.tokenPassword = tokenPassword;
				this.headers = {
					'Authorization': `Basic ${Buffer.from(`${tokenId}:${tokenPassword}`).toString('base64')}`,
				};
				break;

			default:
				this.clear();
				break;
		}
	}

	/**
	 * Reset context to default
	 */
	clear() {
		super.setContext(sessionConstants.GUEST);
		this.headers = {};
		this.tokenId = '';
	}

	/**
	 * Check if http request is allowed based on request key and current context.
	 * Decorate request object if allowed.
	 * @param {string} requestKey
	 * @param {*} requestObject
	 * @param {SuitestErrorOptions} errorOptions - function name which will be invoked by user.
	 * @returns {Promise}
	 */
	authorizeHttp(requestKey, requestObject, errorOptions = {}) {
		if (
			requestKey in allowedRequests.http[super.context] // check if http request key is allowed
			&& allowedRequests.http[super.context][requestKey].includes(requestObject.method) // check if http request method is allowed
		) {
			return Promise.resolve(decorateRequestObject(requestObject, this.headers));
		}

		return Promise.reject(new SuitestError(...suitestErrorArguments(errorOptions)));
	}

	/**
	 * Check if ws request is allowed based on content type and current context.
	 * @param {*} contentObject
	 * @param {string} commandName - function name which will be invoked by user.
	 * @returns {Promise}
	 */
	authorizeWs(contentObject, commandName) {
		if (contentObject && allowedRequests.ws[super.context].includes(contentObject.type)) { // check if ws content type is allowed
			return Promise.resolve(contentObject);
		}

		return Promise.reject(new SuitestError(texts.authNotAllowed(commandName), SuitestError.AUTH_NOT_ALLOWED));
	}

	/**
	 * Check if ws connection is allowed based on current context.
	 * @param {*} connectObject
	 * @param {string} commandName - function name which will be invoked by user.
	 * @returns {Promise}
	 */
	authorizeWsConnection(connectObject, commandName) {
		if (super.context !== sessionConstants.GUEST) {
			return Promise.resolve(decorateRequestObject(connectObject, this.headers));
		}

		return Promise.reject(new SuitestError(texts.authNotAllowed(commandName), SuitestError.AUTH_NOT_ALLOWED));
	}

	getToken() {
		return `${this.tokenId}:${this.tokenPassword}`;
	}
}

module.exports = AuthContext;
