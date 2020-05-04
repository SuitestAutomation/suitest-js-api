/**
 * Module stores current contexts
 */
const Context = require('./utils/Context');
const AuthContext = require('./utils/AuthContext');

const pairedDeviceContext = new Context();
const authContext = new AuthContext();
const appContext = new Context();

module.exports = {
	authContext,
	pairedDeviceContext,
	appContext,
};
