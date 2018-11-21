import {ElementChain, ElementRepeatIntervalChain} from './ElementChain';
import {Omit} from './utils/Omit';

export interface VideoChain extends Omit<ElementChain, 'sendText' | 'setText'> {}
