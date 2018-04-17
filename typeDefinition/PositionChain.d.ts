import {
	AbstractChain,
	Clickable,
	MoveToModifier,
	Repeatable,
	Intervalable,
	BaseChain,
	UntilModifier,
} from './modifiers';

export interface PositionChain extends
	PositionBaseQueryChain<PositionChain>,
	Clickable<PositionRepeatIntervalChain>, // click
	MoveToModifier<PositionEmptyChain> // moveTo
{}

interface PositionRepeatIntervalChain extends
	PositionBaseEvalChain<PositionRepeatIntervalChain>,
	Repeatable<PositionIntervalChain>,
	Intervalable<PositionRepeatChain>,
	UntilModifier<Repeatable<PositionIntervalChain> & Intervalable<PositionRepeatChain>>
{}

// -repeat +interval
interface PositionIntervalChain extends
	PositionBaseEvalChain<PositionIntervalChain>,
	Intervalable<PositionEmptyChain>
{}

// +repeat -interval
interface PositionRepeatChain extends
	PositionBaseEvalChain<PositionRepeatChain>,
	Repeatable<PositionEmptyChain>
{}


interface PositionBaseQueryChain<TSelf> extends
	BaseChain<TSelf, PositionQueryResult, PositionAbandonedChain>
{}

interface PositionBaseEvalChain<TSelf> extends
	BaseChain<TSelf, PositionEvalResult, PositionAbandonedChain>
{}

interface PositionEmptyChain extends PositionBaseEvalChain<PositionEmptyChain> {}
interface PositionAbandonedChain extends AbstractChain {}

type PositionQueryResult = string;
type PositionEvalResult = boolean;
