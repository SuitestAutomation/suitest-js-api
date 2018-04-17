import {
	AbstractChain,
	Repeatable,
	Intervalable,
	BaseChain,
	SendTextModifier,
	WindowModifiers,
	UntilModifier,
} from './modifiers';

export interface WindowChain extends
	WindowBaseQueryChain<WindowChain>,
	SendTextModifier<WindowRepeatIntervalChain>, // sendText
	WindowModifiers.ModalInterruct<WindowEmptyChain>, // acceptModal, dismissModal
	WindowModifiers.Navigate<WindowEmptyChain>, // goForward, goBack
	WindowModifiers.Refresh<WindowEmptyChain>, // refresh
	WindowModifiers.SetSize<WindowEmptyChain> // setSize
{}

interface WindowRepeatIntervalChain extends
	WindowBaseEvalChain<WindowRepeatIntervalChain>,
	UntilModifier<Repeatable<WindowIntervalChain> & Intervalable<WindowRepeatChain>>,
	Repeatable<WindowIntervalChain>,
	Intervalable<WindowRepeatChain>
{}

// -repeat +interval
interface WindowIntervalChain extends
	WindowBaseEvalChain<WindowIntervalChain>,
	Intervalable<WindowEmptyChain>
{}

// +repeat -interval
interface WindowRepeatChain extends
	WindowBaseEvalChain<WindowRepeatChain>,
	Repeatable<WindowEmptyChain>
{}

interface WindowBaseQueryChain<TSelf> extends
	BaseChain<TSelf, WindowQueryResult, WindowAbandonedChain>
{}

interface WindowBaseEvalChain<TSelf> extends
	BaseChain<TSelf, WindowEvalResult, WindowAbandonedChain>
{}

interface WindowEmptyChain extends WindowBaseEvalChain<WindowEmptyChain> {}
interface WindowAbandonedChain extends AbstractChain {}

type WindowQueryResult = string;
type WindowEvalResult = boolean;
