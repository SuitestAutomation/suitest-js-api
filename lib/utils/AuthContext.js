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
	http: {[endpoints.session]: ['POST']},
	ws: [],
};
const accessTokenAllowed = {
	http: {
		[endpoints.session]: ['POST'],
		[endpoints.testPackGenTokens]: ['POST'],
		[endpoints.apps]: ['GET'],
		[endpoints.appById]: ['GET'],
		[endpoints.appTags]: ['GET'],
		[endpoints.appConfigs]: ['GET'],
		[endpoints.appConfigById]: ['GET'],
		[endpoints.appTestPacks]: ['GET'],
		[endpoints.appTestPackById]: ['GET'],
		[endpoints.appTestDefinitions]: ['GET'],
		[endpoints.appTestDefinitionById]: ['GET'],
		[endpoints.devices]: ['GET'],
		[endpoints.testRun]: ['POST'],
		[endpoints.testRunById]: ['GET', 'DELETE'],
		[endpoints.testRunOnDevice]: ['DELETE'],
		[endpoints.testPackRun]: ['POST'],
		[endpoints.testPackRunById]: ['GET', 'DELETE'],
	},
	ws: [],
};
const interactiveSessionTokenAllowed = {
	http: {
		[endpoints.session]: ['POST'],
		[endpoints.sessionClose]: ['POST'],
		[endpoints.apps]: ['GET'],
		[endpoints.appById]: ['GET'],
		[endpoints.appTags]: ['GET'],
		[endpoints.appConfigs]: ['GET'],
		[endpoints.appConfigById]: ['GET'],
		[endpoints.appTestPacks]: ['GET'],
		[endpoints.appTestPackById]: ['GET'],
		[endpoints.appTestDefinitions]: ['GET'],
		[endpoints.appTestDefinitionById]: ['GET'],
		[endpoints.devices]: ['GET'],
	},
	ws: [
		wsContentTypes.startTest, wsContentTypes.endTest,
		wsContentTypes.pairDevice, wsContentTypes.releaseDevice,
		wsContentTypes.selectConfiguration,
	],
};
const automatedSessionTokenAllowed = {
	http: {
		[endpoints.session]: ['POST'],
		[endpoints.sessionClose]: ['POST'],
		[endpoints.apps]: ['GET'],
		[endpoints.appById]: ['GET'],
		[endpoints.appTags]: ['GET'],
		[endpoints.appConfigs]: ['GET'],
		[endpoints.appConfigById]: ['GET'],
		[endpoints.appTestPacks]: ['GET'],
		[endpoints.appTestPackById]: ['GET'],
		[endpoints.appTestDefinitions]: ['GET'],
		[endpoints.appTestDefinitionById]: ['GET'],
		[endpoints.devices]: ['GET'],
	},
	ws: [
		wsContentTypes.startTest, wsContentTypes.endTest,
		wsContentTypes.pairDevice, wsContentTypes.releaseDevice,
		wsContentTypes.selectConfiguration,
	],
};
const allowedRequests = {
	http: {
		[sessionConstants.ACCESS_TOKEN]: accessTokenAllowed.http,
		[sessionConstants.AUTOMATED]: automatedSessionTokenAllowed.http,
		[sessionConstants.INTERACTIVE]: interactiveSessionTokenAllowed.http,
		[sessionConstants.GUEST]: guestAllowed.http,
	},
	ws: {
		[sessionConstants.ACCESS_TOKEN]: accessTokenAllowed.ws,
		[sessionConstants.AUTOMATED]: automatedSessionTokenAllowed.ws,
		[sessionConstants.INTERACTIVE]: interactiveSessionTokenAllowed.ws,
		[sessionConstants.GUEST]: guestAllowed.ws,
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
		this.tokenKey = '';
		super.setContext(sessionConstants.GUEST);
	}

	/**
	 * Set context. Update headers based on new context.
	 *
	 * @param {Symbol} newContext context symbol constant
	 * @param {string|undefined} tokenId
	 * @param {string|undefined} tokenPassword
	 */
	setContext(newContext, tokenId, tokenPassword) {
		switch (newContext) {
			case sessionConstants.ACCESS_TOKEN:
				super.setContext(newContext);
				this.tokenKey = tokenId;
				this.headers = {
					...this.headers,
					'X-TokenId': tokenId,
					'X-TokenPassword': tokenPassword,
				};
				break;

			case sessionConstants.AUTOMATED:
			case sessionConstants.INTERACTIVE:
				super.setContext(newContext);
				this.tokenKey = tokenId;
				this.headers = {
					...this.headers,
					'deviceAccessToken': tokenId};
				break;

			default:
				this.clear();
				break;
		}
	}

	/**
	 * Resest context to default
	 */
	clear() {
		super.setContext(sessionConstants.GUEST);
		this.headers = {};
		this.tokenKey = '';
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
		return this.tokenKey;
	}
}

module.exports = AuthContext;
