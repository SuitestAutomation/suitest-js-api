import {
	AbstractChain,
	HasExitedModifiers,
	BaseChain,
} from './modifiers';

interface ApplicationBaseQueryChain<T> extends
	BaseChain<T, ApplicationQueryResult, ApplicationAbandonedChain>
{}

interface ApplicationEmptyChain extends
	BaseChain<ApplicationEmptyChain, ApplicationEvalResult, ApplicationAbandonedChain>
{}

export interface ApplicationChain extends
	ApplicationBaseQueryChain<ApplicationChain>,
	HasExitedModifiers<ApplicationEmptyChain>
{}

interface ApplicationAbandonedChain extends
	AbstractChain
{}

type ApplicationQueryResult = string;
type ApplicationEvalResult = boolean | void;
