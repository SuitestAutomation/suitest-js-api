import {ElementChain} from './ElementChain';
import {VideoStateModifiers} from './modifiers';

export interface VideoChain extends
	ElementChain,
	VideoStateModifiers<VideoChain>
{}
