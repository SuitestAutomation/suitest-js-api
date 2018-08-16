/* eslint-disable */

const NETWORK_PROP = {
	BODY:   Symbol('body'),
	METHOD: Symbol('method'),
	STATUS: Symbol('status'),
};

Object.freeze(NETWORK_PROP);

const NETWORK_METHOD = {
	GET:     'GET',
	POST:    'POST',
	PUT:     'PUT',
	HEAD:    'HEAD',
	DELETE:  'DELETE',
	CONNECT: 'CONNECT',
	OPTIONS: 'OPTIONS',
	TRACE:   'TRACE',
	PATCH:   'PATCH',
};

Object.freeze(NETWORK_METHOD);

module.exports = {
	NETWORK_PROP,
	NETWORK_METHOD,
};
