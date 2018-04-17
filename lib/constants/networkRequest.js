const NETWORK_PROP = {
	BODY: Symbol('body'),
	METHOD: Symbol('method'),
	STATUS: Symbol('status'),
};

Object.freeze(NETWORK_PROP);

const NETWORK_METHOD = {
	GET: Symbol('GET'),
	POST: Symbol('POST'),
	PUT: Symbol('PUT'),
	HEAD: Symbol('HEAD'),
	DELETE: Symbol('DELETE'),
	CONNECT: Symbol('CONNECT'),
	OPTIONS: Symbol('OPTIONS'),
	TRACE: Symbol('TRACE'),
	PATCH: Symbol('PATCH'),
};

Object.freeze(NETWORK_METHOD);

module.exports = {
	NETWORK_PROP,
	NETWORK_METHOD,
};
