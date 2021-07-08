const {compose, isNil} = require('ramda');
// Import helpers and composers
const makeChain = require('../utils/makeChain');
const {
	hasExitedComposer,
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	cloneComposer,
	assertComposer,
	timeoutComposer,
	gettersComposer,
	makeToJSONComposer,
	intervalComposer,
	repeatComposer,
	untilComposer,
	sendTextComposer,
} = require('../composers');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const {applicationCommandMalformed} = require('../texts');
const {getRequestType} = require('../utils/socketChainHelper');
const SuitestError = require('../utils/SuitestError');
const {
	applyTimeout,
	applyCountAndDelay,
	applyUntilCondition,
} = require('../utils/chainUtils');

const applicationFactory = (classInstance) => {
	const toJSON = data => {
		if (isNil(data.sendText) && (!data.comparator || data.comparator.type !== SUBJ_COMPARATOR.HAS_EXITED)) {
			// Application can only be of "hasExited()" eval / assert
			throw new SuitestError(applicationCommandMalformed(), SuitestError.INVALID_INPUT);
		}

		if (!isNil(data.sendText)) {
			return {
				type: getRequestType(data, false),
				request: compose(
					msg => applyUntilCondition(msg, data),
					msg => applyCountAndDelay(msg, data),
				)({
					type: 'sendText',
					target: {type: 'window'},
					val: data.sendText,
				}),
			};
		}

		return {
			type: getRequestType(data, false),
			request: applyTimeout({
				type: 'assert',
				condition: {
					subject: {
						type: 'application',
					},
					type: 'exited',
				},
			}, data, classInstance.config.defaultTimeout),
		};
	};

	// Build Composers
	const toStringComposer = makeToStringComposer(toJSON);
	const thenComposer = makeThenComposer(toJSON);
	const toJSONComposer = makeToJSONComposer(toJSON);

	/**
	 * Function accepts data object of future chain as input
	 * and returns a list of composers that should build the chain
	 * @param data
	 * @returns {*[]}
	 */
	const getComposers = data => {
		const output = [
			toStringComposer,
			thenComposer,
			cloneComposer,
			gettersComposer,
			toJSONComposer,
		];

		const isSendText = !isNil(data.sendText);
		const isHasExited = data.comparator && data.comparator.type === SUBJ_COMPARATOR.HAS_EXITED;

		if (!data.isAssert) {
			output.push(assertComposer);
		}

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		if (!data.timeout && !isSendText) {
			output.push(timeoutComposer);
		}

		if (!isHasExited && !isSendText) {
			output.push(hasExitedComposer);
		}

		if (isSendText) {
			if (!data.interval) {
				output.push(intervalComposer);
			}

			if (!data.repeat) {
				output.push(repeatComposer);
			}

			if (!data.until) {
				output.push(untilComposer);
			}
		} else if (!isHasExited) {
			output.push(sendTextComposer);
		}

		return output;
	};

	// Chain builder functions
	const applicationChain = () => makeChain(classInstance, getComposers, {type: 'application'});

	return {
		application: applicationChain,
		applicationAssert: () => applicationChain().toAssert(),

		// For Unit tests
		getComposers,
		toJSON,
	};
};

module.exports = applicationFactory;
