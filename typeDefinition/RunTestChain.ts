import {
	AbstractChain,
	Repeatable,
	BaseChain,
	UntilModifier,
} from './modifiers';

export interface RunTestChain extends
	UntilModifier<Repeatable<RunTestRepeatChain>>,
	RunTestRepeatChain
{}

interface RunTestRepeatChain extends
	RunTestBaseChain<RunTestRepeatChain>,
	Repeatable<RunTestEmptyChain>
{}

interface RunTestBaseChain<TSelf> extends
	BaseChain<TSelf, void, RunTestAbandonedChain>
{}

interface RunTestEmptyChain extends RunTestBaseChain<RunTestEmptyChain> {}
interface RunTestAbandonedChain extends AbstractChain {}
