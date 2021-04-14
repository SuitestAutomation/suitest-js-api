import {
	AbstractChain,
	BaseChain
} from './modifiers';

export interface SuspendAppChain extends
	BaseChain<SuspendAppChain, SuspendAppEvalResult, SuspendAppAbandonedChain>
{}


interface SuspendAppAbandonedChain extends AbstractChain {}

type SuspendAppEvalResult = void | boolean;
