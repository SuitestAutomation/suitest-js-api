import {
	AbstractChain,
	Assertable,
	Timeout,
	BaseEmptyChain,
} from './modifiers';

export interface OcrChain extends
	OcrBaseQueryChain<OcrChain>,
	Timeout<OcrWithoutTimeout>
{}

interface OcrWithoutTimeout extends
	OcrBaseQueryChain<OcrWithoutTimeout>
{}

interface OcrBaseQueryChain<TSelf> extends
	BaseEmptyChain<TSelf, OcrQueryResult, OcrAbandonedChain>,
	Assertable<TSelf>
{}

interface OcrAbandonedChain extends AbstractChain {}

type OcrQueryResult = string[];
