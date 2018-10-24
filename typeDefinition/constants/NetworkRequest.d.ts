export type NetworkProp = {
	BODY:   symbol,
	METHOD: symbol,
	STATUS: symbol,
};

export type NetworkMethod = {
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
