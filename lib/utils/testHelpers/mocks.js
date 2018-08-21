/* istanbul ignore file */

const sinon = require('sinon');
const repl = require('../../testLauncher/repl');

const stubRepl = () => sinon.stub(repl, 'startRepl').resolves();
const restoreRepl = () => repl.startRepl.restore();

stubRepl();

module.exports = {
	stubRepl,
	restoreRepl,
};
