import {
	AbstractChain,
	BaseChain
} from './modifiers';

export interface LockChain extends
	BaseChain<LockChain, LockSleepEvalResult, LockAbandonedChain>
{}

interface LockAbandonedChain extends AbstractChain {}

type LockSleepEvalResult = void | boolean;
