import {
	AbstractChain,
	Assertable,
	Timeout,
	BaseEmptyChain,
	Language,
} from './modifiers';

// +language +timeout
export interface OcrChain extends
	OcrBaseQueryChain<OcrChain>,
	Timeout<OcrWithoutTimeout>,
	Language<OcrWithoutLanguage>
{}

// -language +timeout
interface OcrWithoutLanguage extends
	Timeout<OcrEmptyChain>,
	OcrBaseQueryChain<OcrWithoutLanguage>
{}

// + language -timeout
interface OcrWithoutTimeout extends
	Language<OcrEmptyChain>,
	OcrBaseQueryChain<OcrWithoutTimeout>
{}

interface OcrEmptyChain extends
	OcrBaseQueryChain<OcrEmptyChain>
{}

interface OcrBaseQueryChain<TSelf> extends
	BaseEmptyChain<TSelf, OcrQueryResult, OcrAbandonedChain>,
	Assertable<TSelf>
{}

interface OcrAbandonedChain extends AbstractChain {}

type OcrQueryResult = string[];
