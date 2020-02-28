/* istanbul ignore file */
const {curry} = require('ramda');
const assert = require('assert');
const {stripAnsiChars} = require('../stringUtils');

const bySymbol = (a, b) => a.toString() > b.toString() ? 1 : -1;
const getComposerTypes = comps => comps.map(c => c.composerType).sort(bySymbol);

const assertBeforeSendMsg = curry((beforeSendMsgFn, logStub, chainData, substring) => {
	logStub.resetHistory();
	beforeSendMsgFn(chainData);
	const beforeSendMsgLog = stripAnsiChars(logStub.firstCall.args[0]);

	assert.ok(
		beforeSendMsgLog.includes(substring),
		`Substring "${substring}" should be found in beforeSendMsg log: "${beforeSendMsgLog}"`
	);
});

module.exports = {
	bySymbol,
	getComposerTypes,
	assertBeforeSendMsg,
};
