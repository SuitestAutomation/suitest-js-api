import {
	AbstractChain,
	BaseChain
} from './modifiers';

export interface ExecuteBrightScriptChain extends
	BaseChain<ExecuteBrightScriptChain, ExecuteBrightScriptEvalResult, ExecuteBrightScriptAbandonedChain>
{}

interface ExecuteBrightScriptAbandonedChain extends AbstractChain {}

type ExecuteBrightScriptEvalResult = boolean | undefined;
