/* eslint-disable key-spacing */

const SUBJ_COMPARATOR = {
	EXIST:            'exists',
	VISIBLE:          'visible',
	HAS_EXITED:       'hasExited',
	EQUAL:            '=',
	CONTAIN:          '~',
	START_WITH:       '^',
	END_WITH:         '$',
	MATCH:            'has',
	MATCH_JS:         'matches',
	MATCH_BRS:        'matchesBRS',
	REQUEST_MATCHES:  'requestMatches',
	RESPONSE_MATCHES: 'responseMatches',
	HAD_NO_ERROR:     'hadNoError',
};

Object.freeze(SUBJ_COMPARATOR);

// Element properties comparators
const PROP_COMPARATOR = {
	EQUAL:         '=',
	NOT_EQUAL:     '!=',
	APPROX:        '+-',
	CONTAIN:       '~',
	NOT_CONTAIN:   '!~',
	GREATER:       '>',
	EQUAL_GREATER: '>=',
	LESSER:        '<',
	EQUAL_LESSER:  '<=',
	START:         '^',
	NOT_START:     '!^',
	END:           '$',
	NOT_END:       '!$',
};

Object.freeze(PROP_COMPARATOR);

module.exports = {
	SUBJ_COMPARATOR,
	PROP_COMPARATOR,
};
