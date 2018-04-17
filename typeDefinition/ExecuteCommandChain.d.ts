import {
	AbstractChain,
	BaseChain
} from './modifiers';

export interface ExecuteCommandChain extends
	BaseChain<ExecuteCommandChain, ExecuteCommandEvalResult, ExecuteCommandAbandonedChain>
{}

interface ExecuteCommandAbandonedChain extends AbstractChain {}

type ExecuteCommandEvalResult = boolean;
