import {
    AbstractChain,
    ElementMatchModifiers,
    Timeout,
    BaseChain,
    VideoStateModifiers,
} from './modifiers';
import {NativeVideoProps} from "./constants/ElementProps";

export interface NativeVideoChain extends
    NativeVideoBaseQueryChain<NativeVideoChain>,
    Timeout<NativeVideoWithoutTimeout>,
    NativeVideoEvalModifiers<NativeVideoWithoutEvalChain>
{}

// -matchers +timeout
interface NativeVideoWithoutEvalChain extends
    NativeVideoBaseEvalChain<NativeVideoWithoutEvalChain>,
    Timeout<NativeVideoEmptyChain>
{}

// +matches -timeout
interface NativeVideoWithoutTimeout extends
    NativeVideoBaseEvalChain<NativeVideoWithoutTimeout>,
    NativeVideoEvalModifiers<NativeVideoEmptyChain>
{}

interface NativeVideoEmptyChain extends
    NativeVideoBaseEvalChain<NativeVideoEmptyChain>
{}

interface NativeVideoEvalModifiers<T> extends
    VideoStateModifiers<T>,
    Omit<ElementMatchModifiers<T>, 'matchesRepo' | 'matchRepo'>
{}

interface NativeVideoBaseQueryChain<TSelf> extends
    BaseChain<TSelf, NativeVideoQueryResult, NativeVideoAbandonedChain>
{}

// base interface with then method
interface NativeVideoBaseEvalChain<TSelf> extends
    BaseChain<TSelf, NativeVideoEvalResult, NativeVideoAbandonedChain>
{}

interface NativeVideoAbandonedChain extends AbstractChain {}

type NativeVideoQueryResult = NativeVideoProps | void;
type NativeVideoEvalResult = boolean | void;
