import {
	AbstractChain,
	BaseChain,
	DeviceModifiers,
} from './modifiers';

export interface DeviceChain extends
	DeviceBaseQueryChain<DeviceChain>,
	DeviceModifiers.SetOrientation<DeviceEmptyChain> // setOrientation
{}

interface DeviceBaseQueryChain<TSelf> extends
	BaseChain<TSelf, DeviceQueryResult, DeviceAbandonedChain>
{}

interface DeviceBaseEvalChain<TSelf> extends
	BaseChain<TSelf, DeviceEvalResult, DeviceAbandonedChain>
{}

interface DeviceEmptyChain extends DeviceBaseEvalChain<DeviceEmptyChain> {}
interface DeviceAbandonedChain extends AbstractChain {}

type DeviceQueryResult = string;
type DeviceEvalResult = boolean | void;
