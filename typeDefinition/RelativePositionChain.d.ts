import {
	AbstractChain,
	Clickable,
	MoveToModifier,
	Repeatable,
	Intervalable,
	BaseChain,
	UntilModifier,
} from './modifiers';

export interface RelativePosition extends
	RelativePositionBaseQueryChain<RelativePosition>,
	Clickable<RelativePositionRepeatIntervalChain>, // click
	MoveToModifier<RelativePositionEmptyChain> // moveTo
{}

interface RelativePositionRepeatIntervalChain extends
	RelativePositionBaseEvalChain<RelativePositionRepeatIntervalChain>,
	Repeatable<RelativePositionIntervalChain>,
	Intervalable<RelativePositionRepeatChain>,
	UntilModifier<Repeatable<RelativePositionIntervalChain> & Intervalable<RelativePositionRepeatChain>>
{}

// -repeat +interval
interface RelativePositionIntervalChain extends
	RelativePositionBaseEvalChain<RelativePositionIntervalChain>,
	Intervalable<RelativePositionEmptyChain>
{}

// +repeat -interval
interface RelativePositionRepeatChain extends
	RelativePositionBaseEvalChain<RelativePositionRepeatChain>,
	Repeatable<RelativePositionEmptyChain>
{}

interface RelativePositionBaseQueryChain<TSelf> extends
	BaseChain<TSelf, RelativePositionQueryResult, RelativePositionAbandonedChain>
{}

interface RelativePositionBaseEvalChain<TSelf> extends
	BaseChain<TSelf, RelativePositionEvalResult, RelativePositionAbandonedChain>
{}

interface RelativePositionEmptyChain extends RelativePositionBaseEvalChain<RelativePositionEmptyChain> {}
interface RelativePositionAbandonedChain extends AbstractChain {}

type RelativePositionQueryResult = string;
type RelativePositionEvalResult = boolean | undefined;
