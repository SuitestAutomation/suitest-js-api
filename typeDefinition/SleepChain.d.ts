import {
	AbstractChain,
	BaseChain
} from './modifiers';

export interface SleepChain extends
	BaseChain<SleepChain, SleepEvalResult, SleepAbandonedChain>
{}

interface SleepAbandonedChain extends AbstractChain {}

type SleepEvalResult = undefined | boolean;
