import {
	AbstractChain,
	BaseChain,
} from './modifiers';

export interface SetScreenOrientationChain extends
	BaseChain<SetScreenOrientationChain, SetScreenOrientationEvalResult, SetScreenOrientationAbandonedChain>
{}

interface SetScreenOrientationAbandonedChain extends AbstractChain {}

type SetScreenOrientationEvalResult = unknown;
