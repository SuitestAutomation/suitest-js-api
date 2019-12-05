const {makeMethodComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

/**
 * Defines abandon method.
 */
const makeToStringComposer = (toStringMethod, toJsonMethod) =>
	makeMethodComposer(
		composers.TO_STRING,
		['toString'],
		// TODO(SUIT-14046) toJsonMethod should be mandatory after refactoring
		chain => {
			if (toJsonMethod) {
				const jsonMessage = toJsonMethod(chain);

				return jsonMessage.type === 'testLine' && 'request' in jsonMessage
					? toStringMethod.call(undefined, jsonMessage.request)
					: toStringMethod.call(undefined, jsonMessage);
			}

			// TODO: is exists some reason for using call method instead direct invoking?
			return toStringMethod.call(undefined, chain);
		}
	);

module.exports = makeToStringComposer;
