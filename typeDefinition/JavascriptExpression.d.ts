import {
	AbstractChain,
	Negatable,
	Timeout,
	StringModifiers,
	BaseChain,
} from './modifiers';


// +matchers +timeout +negation
export interface JsExpressionChain extends
	JsExpressionBaseQueryChain<JsExpressionChain>,
	Negatable<JsExpressionEvalTimeoutChain>,
	Timeout<JsExpressionEvalNegationChain>,
	JsExpressionEvalModifiers<JsExpressionTimeoutNegationChain>
{}

// -matchers +timeout +negation
interface JsExpressionTimeoutNegationChain extends
	JsExpressionBaseEvalChain<JsExpressionTimeoutNegationChain>,
	Negatable<JsExpressionTimeoutChain>,
	Timeout<JsExpressionNegationChain>
{}

// +matchers -timeout +negation
interface JsExpressionEvalNegationChain extends
	JsExpressionBaseEvalChain<JsExpressionEvalNegationChain>,
	Negatable<JsExpressionEvalChain>,
	JsExpressionEvalModifiers<JsExpressionNegationChain>
{}

// +matchers +timeout -negation
interface JsExpressionEvalTimeoutChain extends
	JsExpressionBaseEvalChain<JsExpressionEvalTimeoutChain>,
	Timeout<JsExpressionEvalChain>,
	JsExpressionEvalModifiers<JsExpressionTimeoutChain>
{}

// -matchers -timeout +negation
interface JsExpressionNegationChain extends
	JsExpressionBaseEvalChain<JsExpressionNegationChain>,
	Negatable<JsExpressionEmptyChain>
{}

// -matchers +timeout -negation
interface JsExpressionTimeoutChain extends
	JsExpressionBaseEvalChain<JsExpressionTimeoutChain>,
	Timeout<JsExpressionEmptyChain>
{}

// +matchers -timeout -negation
interface JsExpressionEvalChain extends
	JsExpressionBaseEvalChain<JsExpressionEvalChain>,
	JsExpressionEvalModifiers<JsExpressionEmptyChain>
{}

// -matchers -timeout -negation
interface JsExpressionEmptyChain extends JsExpressionBaseEvalChain<JsExpressionEmptyChain> {}

interface JsExpressionBaseQueryChain<TSelf> extends
	BaseChain<TSelf, JsExpressionQueryResult, JsExpressionAbandonedChain>
{}

interface JsExpressionBaseEvalChain<TSelf> extends
	BaseChain<TSelf, JsExpressionEvalResult, JsExpressionAbandonedChain>
{}


interface JsExpressionEvalModifiers<T> extends
	StringModifiers<T>
{}

interface JsExpressionAbandonedChain extends
	AbstractChain
{}

type JsExpressionQueryResult = string;
type JsExpressionEvalResult = boolean | undefined;
