import {
	Abandable,
	AbstractChain,
	Thenable
} from './modifiers';

export interface GetLastVTScreenshotChain<TResult> extends
	AbstractChain,
	Abandable<GetLastVTScreenshotAbandonedChain>,
	Thenable<TResult>
{}

interface GetLastVTScreenshotAbandonedChain extends AbstractChain {}
