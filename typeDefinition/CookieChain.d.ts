import {
	AbstractChain,
	Negatable,
	Timeout,
	ExistsModifiers,
	MatchJSModifiers,
	StringModifiers,
	BaseChain,
} from './modifiers';

// +matchers +timeout +negation
export interface CookieChain extends
	CookieBaseQueryChain<CookieChain>,
	Negatable<CookieWithoutNegation>,
	Timeout<CookieWithoutTimeout>,
	CookieEvalModifiers<CookieWithoutEvalChain>
{}

// -matchers +timeout +negation
interface CookieWithoutEvalChain extends
	CookieBaseEvalChain<CookieWithoutEvalChain>,
	Negatable<CookieTimeoutChain>,
	Timeout<CookieNegationChain>
{}

// +mathces -timeout +negation
interface CookieWithoutTimeout extends
	CookieBaseQueryChain<CookieWithoutTimeout>,
	Negatable<CookieEvalChain>,
	CookieEvalModifiers<CookieNegationChain>
{}

// +mathces +timeout -negation
interface CookieWithoutNegation extends
	CookieBaseEvalChain<CookieWithoutNegation>,
	Timeout<CookieEvalChain>,
	CookieEvalModifiers<CookieTimeoutChain>
{}

// +matchers -timeout -negation
interface CookieEvalChain extends
	CookieBaseEvalChain<CookieEvalChain>,
	CookieEvalModifiers<CookieEmptyChain>
{}

// -matchers +timeout -negation
interface CookieTimeoutChain extends
	CookieBaseEvalChain<CookieTimeoutChain>,
	Timeout<CookieEmptyChain>
{}

// -matchers -timeout +negation
interface CookieNegationChain extends
	CookieBaseEvalChain<CookieNegationChain>,
	Negatable<CookieEmptyChain>
{}

// -matchers -timeout -negation
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

type CookieQueryResult = string;
type CookieEvalResult = boolean;
