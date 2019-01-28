import {
	AbstractChain,
	Negatable,
	Timeout,
	StringModifiers,
	BaseChain,
} from './modifiers';


// +matchers +timeout +negation
export interface BrightScriptExpressionChain extends
	BrightScriptExpressionBaseQueryChain<BrightScriptExpressionChain>,
	Negatable<BrightScriptExpressionEvalTimeoutChain>,
	Timeout<BrightScriptExpressionEvalNegationChain>,
	BrightScriptExpressionEvalModifiers<BrightScriptExpressionTimeoutNegationChain>
{}

// -matchers +timeout +negation
interface BrightScriptExpressionTimeoutNegationChain extends
	BrightScriptExpressionBaseEvalChain<BrightScriptExpressionTimeoutNegationChain>,
	Negatable<BrightScriptExpressionTimeoutChain>,
	Timeout<BrightScriptExpressionNegationChain>
{}

// +matchers -timeout +negation
interface BrightScriptExpressionEvalNegationChain extends
	BrightScriptExpressionBaseEvalChain<BrightScriptExpressionEvalNegationChain>,
	Negatable<BrightScriptExpressionEvalChain>,
	BrightScriptExpressionEvalModifiers<BrightScriptExpressionNegationChain>
{}

// +matchers +timeout -negation
interface BrightScriptExpressionEvalTimeoutChain extends
	BrightScriptExpressionBaseEvalChain<BrightScriptExpressionEvalTimeoutChain>,
	Timeout<BrightScriptExpressionEvalChain>,
	BrightScriptExpressionEvalModifiers<BrightScriptExpressionTimeoutChain>
{}

// -matchers -timeout +negation
interface BrightScriptExpressionNegationChain extends
	BrightScriptExpressionBaseEvalChain<BrightScriptExpressionNegationChain>,
	Negatable<BrightScriptExpressionEmptyChain>
{}

// -matchers +timeout -negation
interface BrightScriptExpressionTimeoutChain extends
	BrightScriptExpressionBaseEvalChain<BrightScriptExpressionTimeoutChain>,
	Timeout<BrightScriptExpressionEmptyChain>
{}

// +matchers -timeout -negation
interface BrightScriptExpressionEvalChain extends
	BrightScriptExpressionBaseEvalChain<BrightScriptExpressionEvalChain>,
	BrightScriptExpressionEvalModifiers<BrightScriptExpressionEmptyChain>
{}

// -matchers -timeout -negation
interface BrightScriptExpressionEmptyChain extends BrightScriptExpressionBaseEvalChain<BrightScriptExpressionEmptyChain> {}

interface BrightScriptExpressionBaseQueryChain<TSelf> extends
	BaseChain<TSelf, BrightScriptExpressionQueryResult, BrightScriptExpressionAbandonedChain>
{}

interface BrightScriptExpressionBaseEvalChain<TSelf> extends
	BaseChain<TSelf, BrightScriptExpressionEvalResult, BrightScriptExpressionAbandonedChain>
{}


interface BrightScriptExpressionEvalModifiers<T> extends
	StringModifiers<T>
{}

interface BrightScriptExpressionAbandonedChain extends
	AbstractChain
{}

type BrightScriptExpressionQueryResult = string;
type BrightScriptExpressionEvalResult = boolean | void;
