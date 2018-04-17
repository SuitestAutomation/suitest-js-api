const SUBJ_COMPARATOR = {
	EXIST: Symbol('exist'),
	HAS_EXITED: Symbol('hasExited'),
	EQUAL: Symbol('equal'),
	CONTAIN: Symbol('contain'),
	START_WITH: Symbol('startWith'),
	END_WITH: Symbol('endWith'),
	MATCH: Symbol('match'),
	MATCH_JS: Symbol('matchJS'),
	REQUEST_MATCHES: Symbol('requestMatches'),
	RESPONSE_MATCHES: Symbol('responseMatches'),
};

Object.freeze(SUBJ_COMPARATOR);

// Element properties comparators
const PROP_COMPARATOR = {
	EQUAL: Symbol('='),
	NOT_EQUAL: Symbol('!='),
	APPROX: Symbol('+-'),
	CONTAIN: Symbol('~'),
	NOT_CONTAIN: Symbol('!~'),
	GREATER: Symbol('>'),
	EQUAL_GREATER: Symbol('>='),
	LESSER: Symbol('<'),
	EQUAL_LESSER: Symbol('<='),
	START: Symbol('^'),
	NOT_START: Symbol('!^'),
	END: Symbol('$'),
	NOT_END: Symbol('!$'),
};

Object.freeze(PROP_COMPARATOR);

module.exports = {
	SUBJ_COMPARATOR,
	PROP_COMPARATOR,
};
