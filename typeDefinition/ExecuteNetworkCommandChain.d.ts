import {
	AbstractChain,
	BaseChain,
} from './modifiers';

/**
 * Rates in bytes per second; null means no limit and 0 takes that direction offline
 */
export interface NetworkThrottling {
	downloadBytesPerSec: number | null;
	uploadBytesPerSec: number | null;
}

export interface ExecuteNetworkCommandChain extends
	BaseChain<ExecuteNetworkCommandChain, ExecuteNetworkCommandEvalResult, ExecuteNetworkCommandAbandonedChain>
{}

interface ExecuteNetworkCommandAbandonedChain extends AbstractChain {}

type ExecuteNetworkCommandEvalResult = void | boolean;
