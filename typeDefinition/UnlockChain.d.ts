import {
	AbstractChain,
	BaseChain
} from './modifiers';

export interface UnlockChain extends
	BaseChain<UnlockChain, UnlockSleepEvalResult, UnlockAbandonedChain>
{}

interface UnlockAbandonedChain extends AbstractChain {}

type UnlockSleepEvalResult = void | boolean;
