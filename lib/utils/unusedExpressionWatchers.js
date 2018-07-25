const logger = require('./logger');
const {getFirstStackLine} = require('./stackTraceParser');
const texts = require('./../texts');

/**
 * Pool of chains, that were not awaited for
 * @type {Set<any>}
 */
const unusedLeaves = new Set();
/**
 * @description data about leaves code location
 * @type {Map<Object, string>}
 */
const unusedLeavesData = new Map();
/**
 * Add chain to pool
 * @param {Object} chain
 * @param {string} [stack]
 */
const registerLeaf = (chain, stack = '') => {
	unusedLeavesData.set(chain, getFirstStackLine(stack));
	unusedLeaves.add(chain);
};

/**
 * Remove chain from pool
 * @param chain
 */
const unregisterLeaf = chain => {
	unusedLeavesData.delete(chain);
	unusedLeaves.delete(chain);
};

/**
 * Function should be called before process ends to warn user about
 * unawaited leaves
 */
const warnUnusedLeaves = () => {
	const output = [];

	for (const chain of unusedLeaves) {
		const leafData = unusedLeavesData.get(chain);
		const description = chain ? `- ${chain.toString()}.` : '';

		output.push(`${leafData} ${description}`);
	}

	if (output.length) {
		logger.warn(texts.unusedLeaves('\t' + output.join('\n\t')));
	}
};

/**
 * This is useful for debugging
 * @returns {Array<Object>}
 */
const getUnusedLeaves = () => Array.from(unusedLeaves);

/**
 * Clear pool, e.g. when resetting environment
 * or during unit testing
 */
const clearPool = () => {
	unusedLeaves.clear();
};

module.exports = {
	registerLeaf,
	unregisterLeaf,
	warnUnusedLeaves,
	getUnusedLeaves,
	clearPool,
};
