import {
	AbstractChain,
	Repeatable,
	Intervalable,
	BaseChain,
	UntilModifier,
} from './modifiers';

export interface PressButtonChain extends
	PressButtonBaseQueryChain<PressButtonChain>,
	UntilModifier<Repeatable<PressButtonIntervalChain> & Intervalable<PressButtonRepeatChain>>,
	Repeatable<PressButtonIntervalChain>,
	Intervalable<PressButtonRepeatChain>
{}

// -repeat +interval
interface PressButtonIntervalChain extends
	PressButtonBaseEvalChain<PressButtonIntervalChain>,
	Intervalable<PressButtonEmptyChain>
{}

// +repeat -interval
interface PressButtonRepeatChain extends
	PressButtonBaseEvalChain<PressButtonRepeatChain>,
	Repeatable<PressButtonEmptyChain>
{}


interface PressButtonBaseQueryChain<TSelf> extends
	BaseChain<TSelf, PressButtonQueryResult, PressButtonAbandonedChain>
{}

interface PressButtonBaseEvalChain<TSelf> extends
	BaseChain<TSelf, PressButtonEvalResult, PressButtonAbandonedChain>
{}

interface PressButtonEmptyChain extends PressButtonBaseEvalChain<PressButtonEmptyChain> {}
interface PressButtonAbandonedChain extends AbstractChain {}

type PressButtonQueryResult = string;
type PressButtonEvalResult = boolean | void;
