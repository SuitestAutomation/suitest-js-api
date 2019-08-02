import {
    AbstractChain,
    ElementMatchModifiers,
    Timeout,
    BaseChain,
    VideoStateModifiers,
} from './modifiers';
import {PlayStationVideoProps} from "./constants/ElementProps";

export interface PlayStationVideoChain extends
    PlayStationVideoBaseQueryChain<PlayStationVideoChain>,
    Timeout<PlayStationVideoWithoutTimeout>,
    PlayStationVideoEvalModifiers<PlayStationVideoWithoutEvalChain>
{}

// -matchers +timeout
interface PlayStationVideoWithoutEvalChain extends
    PlayStationVideoBaseEvalChain<PlayStationVideoWithoutEvalChain>,
    Timeout<PlayStationVideoEmptyChain>
{}

// +matches -timeout
interface PlayStationVideoWithoutTimeout extends
    PlayStationVideoBaseEvalChain<PlayStationVideoWithoutTimeout>,
    PlayStationVideoEvalModifiers<PlayStationVideoEmptyChain>
{}

interface PlayStationVideoEmptyChain extends
    PlayStationVideoBaseEvalChain<PlayStationVideoEmptyChain>
{}

interface PlayStationVideoEvalModifiers<T> extends
    VideoStateModifiers<T>,
    Omit<ElementMatchModifiers<T>, 'matchesRepo' | 'matchRepo'>
{}

interface PlayStationVideoBaseQueryChain<TSelf> extends
    BaseChain<TSelf, PlayStationVideoQueryResult, PlayStationVideoAbandonedChain>
{}

// base interface with then method
interface PlayStationVideoBaseEvalChain<TSelf> extends
    BaseChain<TSelf, PlayStationVideoEvalResult, PlayStationVideoAbandonedChain>
{}

interface PlayStationVideoAbandonedChain extends AbstractChain {}

type PlayStationVideoQueryResult = PlayStationVideoProps | void;
type PlayStationVideoEvalResult = boolean | void;
