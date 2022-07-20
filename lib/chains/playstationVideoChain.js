// Import utils
const makeChain = require('../utils/makeChain');

// Import chain composers
const {
	matchComposer,
	timeoutComposer,
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	cloneComposer,
	assertComposer,
	gettersComposer,
	makeToJSONComposer,
	isPlayingComposer,
	isStoppedComposer,
	isPausedComposer,
	hadNoErrorComposer,
} = require('../composers');
const {getRequestType} = require('../utils/socketChainHelper');
const {getMatchExpression, applyTimeout} = require('../utils/chainUtils');
const {SUBJ_COMPARATOR} = require('../constants/comparator');
const SuitestError = require('../utils/SuitestError');
const {psVideoMalformed} = require('../texts');

const playstationVideoFactory = (classInstance) => {
	const toJSON = data => {
		const type = getRequestType(data);
		const socketMessage = {type};
		const subject = {
			type: 'psVideo',
		};
		let videoLineMalformed = true;

		// query
		if (type === 'query') {
			videoLineMalformed = false;
			socketMessage.subject = {
				type: 'elementProps',
				selector: {psVideo: true},
			};
		}

		// element subject
		if (data.comparator) {
			videoLineMalformed = false;
			socketMessage.request = applyTimeout({
				type: 'assert',
				condition: {subject},
			}, data, classInstance.config.defaultTimeout);

			socketMessage.request.condition.type = data.comparator.type;

			if (data.comparator.type === SUBJ_COMPARATOR.HAD_NO_ERROR) {
				socketMessage.request.condition.searchStrategy = data.searchStrategy;
			} else {
				// match props
				socketMessage.request.condition.expression = getMatchExpression(data);
			}
		}
		if (videoLineMalformed) {
			throw new SuitestError(psVideoMalformed(), SuitestError.INVALID_INPUT);
		}

		return socketMessage;
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
	const getComposers = (data) => {
		const output = [
			toStringComposer,
			thenComposer,
			cloneComposer,
			gettersComposer,
			toJSONComposer,
		];

		if (!data.isAssert) {
			output.push(assertComposer);
		}

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		if (!data.timeout) {
			output.push(timeoutComposer);
		}

		if (!data.comparator) {
			output.push(
				hadNoErrorComposer,
				matchComposer,
				isPlayingComposer,
				isStoppedComposer,
				isPausedComposer,
			);
		}

		return output;
	};

	const playstationVideoChain = () => makeChain(classInstance, getComposers, {});

	return {
		playstationVideo: playstationVideoChain,
		playstationVideoAssert: () => playstationVideoChain().toAssert(),
	};
};

module.exports = playstationVideoFactory;
