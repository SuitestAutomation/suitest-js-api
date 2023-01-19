// Element properties comparators
import {ValueOf} from '../utils';

export type PropComparators = {
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

export type StringPropComparators = ValueOf<Pick<
	PropComparators,
	'EQUAL' | 'NOT_EQUAL' | 'CONTAIN' | 'NOT_CONTAIN' | 'START' | 'NOT_START' | 'END' | 'NOT_END'
>>;

export type BooleanPropComparators = ValueOf<Pick<
	PropComparators,
	'EQUAL' | 'NOT_EQUAL'
>>;
