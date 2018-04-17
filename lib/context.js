/**
 * Module stores current contexts
 */
const Context = require('./utils/Context');
const AuthContext = require('./utils/AuthContext');

const testContext = new Context();
const pairedDeviceContext = new Context();
const authContext = new AuthContext();
const appContext = new Context();

module.exports = {
	authContext,
	testContext,
	pairedDeviceContext,
	appContext,
};
