import {
	AbstractChain,
	Negatable,
	Timeout,
	ExistsModifiers,
	MatchJSModifiers,
	StringModifiers,
	BaseChain,
	WithProperties,
} from './modifiers';
import {CookieProp} from './constants/CookieProp';
import {BooleanPropComparators, StringPropComparators} from './constants/PropComparators';
import {Satisfies, ValueOf} from './utils';

// +matchers +timeout +negation +withProperties
export interface CookieChain extends
	CookieBaseQueryChain<CookieChain>,
	Negatable<CookieWithoutNegation>,
	Timeout<CookieWithoutTimeout>,
	CookieEvalModifiers<CookieWithoutEvalChain>,
	WithProperties<CookiePropItem, CookieEmptyChain>
{}

// -matchers +timeout +negation -withProperties
interface CookieWithoutEvalChain extends
	CookieBaseEvalChain<CookieWithoutEvalChain>,
	Negatable<CookieTimeoutChain>,
	Timeout<CookieNegationChain>
{}

// +matchers -timeout +negation -withProperties
interface CookieWithoutTimeout extends
	CookieBaseQueryChain<CookieWithoutTimeout>,
	Negatable<CookieEvalChain>,
	CookieEvalModifiers<CookieNegationChain>
{}

// +matchers +timeout -negation -withProperties
interface CookieWithoutNegation extends
	CookieBaseEvalChain<CookieWithoutNegation>,
	Timeout<CookieEvalChain>,
	CookieEvalModifiers<CookieTimeoutChain>
{}

// +matchers -timeout -negation -withProperties
interface CookieEvalChain extends
	CookieBaseEvalChain<CookieEvalChain>,
	CookieEvalModifiers<CookieEmptyChain>
{}

// -matchers +timeout -negation -withProperties
interface CookieTimeoutChain extends
	CookieBaseEvalChain<CookieTimeoutChain>,
	Timeout<CookieEmptyChain>
{}

// -matchers -timeout +negation -withProperties
interface CookieNegationChain extends
	CookieBaseEvalChain<CookieNegationChain>,
	Negatable<CookieEmptyChain>
{}

// -matchers -timeout -negation -withProperties
interface CookieEmptyChain extends
	CookieBaseEvalChain<CookieEmptyChain>
{}

interface CookieBaseQueryChain<TSelf> extends BaseChain<TSelf, CookieQueryResult, CookieAbandonedChain> {}
interface CookieBaseEvalChain<TSelf> extends BaseChain<TSelf, CookieEvalResult, CookieAbandonedChain> {}

interface CookieEvalModifiers<T> extends
	StringModifiers<T>,
	MatchJSModifiers<T>,
	ExistsModifiers<T>
{}

interface CookieAbandonedChain extends AbstractChain {}

type CookiePropName = ValueOf<CookieProp>;
type CookiePropStringItem = {
	property: Satisfies<'value' | 'path' | 'domain', CookiePropName>,
	val: string,
	type?: StringPropComparators,
};
type CookiePropBooleanItem = {
	property: Satisfies<'httpOnly' | 'secure', CookiePropName>,
	val: boolean,
	type?: BooleanPropComparators,
};
type CookiePropItem =
	| CookiePropStringItem
	| CookiePropBooleanItem;

type CookieQueryResult = string | undefined;
type CookieEvalResult = boolean | undefined;
