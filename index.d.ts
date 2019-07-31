import {LocationChain} from './typeDefinition/LocationChain';
import {ApplicationChain} from './typeDefinition/ApplicationChain';
import {ClearAppDataChain} from './typeDefinition/ClearAppData';
import {CookieChain} from './typeDefinition/CookieChain';
import {ElementChain} from './typeDefinition/ElementChain';
import * as elementTypes from './typeDefinition/constants/Element';
import {ExecuteCommandChain} from './typeDefinition/ExecuteCommandChain';
// import {ExecuteBrightScriptChain} from './typeDefinition/ExecuteBrightScriptChain';
import {JsExpressionChain} from './typeDefinition/JavascriptExpression';
// import {BrightScriptExpressionChain} from './typeDefinition/BrightScriptExpression';
import {OpenAppChain} from './typeDefinition/OpenAppChain';
import {NetworkRequestChain} from './typeDefinition/NetworkRequest';
import {OpenUrlChain} from './typeDefinition/OpenUrl';
import {PollUrlChain} from './typeDefinition/PollUrl';
import {PositionChain} from './typeDefinition/PositionChain';
import {PressButtonChain} from './typeDefinition/PressButton';
import {VrcConstants} from './typeDefinition/constants/Vrc';
import {SleepChain} from './typeDefinition/SleepChain';
import {VideoChain} from './typeDefinition/VideoChain';
import {WindowChain} from './typeDefinition/WindowChain';
import {VideoState} from './typeDefinition/constants/VideoState';
import {VisibilityState} from './typeDefinition/constants/VisibilityState';
import {Keys} from './typeDefinition/constants/Keys';
import {NetworkMethod, NetworkProp} from './typeDefinition/constants/NetworkRequest';
import {ContentMode} from './typeDefinition/constants/ContentMode';
import {ElementState} from './typeDefinition/constants/ElementState';
import {TextAlignment} from './typeDefinition/constants/TextAlignment';
import {BorderStyle} from './typeDefinition/constants/BorderStyle';
import {ReplOptions} from './typeDefinition/InteractiveCommandChain';
import {ImageLoadState} from './typeDefinition/constants/ImageLoadState';
import {NativeVideoChain} from './typeDefinition/NativeVideoChain';

// --------------- Suitest Interface ---------------------- //

declare var suitest: suitest.ISuitest;

export = suitest;

declare namespace suitest {
	export interface ISuitestBase {
		startTestPack(options: StartTestPackOptions): Promise<StartTestPackResult|SuitestError>;
		openSession(options: OpenSessionOptions): Promise<OpenSessionResult|SuitestError>;
		closeSession(): Promise<object|SuitestError>;
		setAppConfig(configId: string, options?: ConfigOverride): Promise<void|SuitestError>;
		pairDevice(deviceId: string): Promise<DeviceData|SuitestError>;
		releaseDevice(): Promise<void|SuitestError>;
		startTest(clientTestId: string, options?: StartTestOptions): Promise<void|SuitestError>;
		endTest(): Promise<void|SuitestError>;
		configure(config: ConfigureOptions): Promise<void|SuitestError>;
		interactive(options: ReplOptions): Promise<void>;

		// subjects
		location(): LocationChain;
		application(): ApplicationChain;
		clearAppData(): ClearAppDataChain;
		cookie(cookieName: string): CookieChain;
		element(elementSelector: ElementSelector | string): ElementChain;
		video(): VideoChain;
		nativeVideo(): NativeVideoChain;
		executeCommand(jsCode: string): ExecuteCommandChain;
		executeCommand(jsCode: Function): ExecuteCommandChain;
		jsExpression(expression: string): JsExpressionChain;
		jsExpression(expression: Function): JsExpressionChain;
		// executeBrightScript(brsCode: string): ExecuteBrightScriptChain;
		// brightScriptExpression(expression: string): BrightScriptExpressionChain;
		openApp(relativeUrl?: string): OpenAppChain;
		networkRequest(): NetworkRequestChain;
		openUrl(absoluteUrl: string): OpenUrlChain;
		pollUrl(url: string, response: string): PollUrlChain;
		position(x: number, y: number): PositionChain;
		press(key: string): PressButtonChain;
		press(keys: string[]): PressButtonChain;
		sleep(milliseconds: number): SleepChain;
		window(): WindowChain;

		// constants
		PROP: elementTypes.ElementPropTypes;
		COMP: elementTypes.PropComparators;
		VALUE: elementTypes.ValueTypes;
		VRC: VrcConstants;
		VIDEO_STATE: VideoState;
		VISIBILITY_STATE: VisibilityState;
		CONTENT_MODE: ContentMode;
		ELEMENT_STATE: ElementState;
		TEXT_ALIGNMENT: TextAlignment;
		IMAGE_LOAD_STATE: ImageLoadState;
		BORDER_STYLE: BorderStyle;
		KEY: Keys;
		NETWORK_PROP: NetworkProp;
		NETWORK_METHOD: NetworkMethod;

		authContext: AuthContext;
		appContext: Context;
		pairedDeviceContext: Context;
		testContext: Context;
	}

	export interface ISuitest extends ISuitestBase {
		assert: AssertChains;
	}

	interface AssertChains {
		location(): LocationChain;
		application(): ApplicationChain;
		clearAppData(): ClearAppDataChain;
		cookie(cookieName: string): CookieChain;
		element(elementSelector: ElementSelector | string): ElementChain;
		video(): VideoChain;
		nativeVideo(): NativeVideoChain;
		executeCommand(jsCode: string): ExecuteCommandChain;
		executeCommand(jsCode: Function): ExecuteCommandChain;
		jsExpression(expression: string): JsExpressionChain;
		jsExpression(expression: Function): JsExpressionChain;
		// executeBrightScript(brsCode: string): ExecuteBrightScriptChain;
		// brightScriptExpression(expression: string): BrightScriptExpressionChain;
		openApp(relativeUrl?: string): OpenAppChain;
		networkRequest(): NetworkRequestChain;
		openUrl(absoluteUrl: string): OpenUrlChain;
		pollUrl(url: string, response: string): PollUrlChain;
		position(x: number, y: number): PositionChain;
		press(key: string): PressButtonChain;
		press(keys: string[]): PressButtonChain;
		sleep(milliseconds: number): SleepChain;
		window(): WindowChain;
	}

	interface DeviceData {
		id: string;
		firmware: string;
		deviceMeta: {
			codeName: string;
			deviceType: string;
		};
		status: {
			type: string;
			canPair: boolean;
		};
		platforms: string[];
		workingPlatforms: string[];
	}

	interface ConfigOverride {
		url?: string;
		suitestify?: boolean;
		domainList?: string[];
		freezeRules?: Array<{
			methods: string[];
			url: string;
			type: string;
			toUrl: string;
		}>;
		codeOverrides?: object;
		configVariables?: Array<{
			name: string;
			value: string;
		}>;
		openAppOverrideTest?: string;
		[key: string]: any; // user should have ability to pass any property to config object
	}

	interface StartTestPackOptions {
		testPackId: number;
		accessTokenKey: string;
		accessTokenPassword: string;
		config?: ConfigOverride;
		metadata?: {
			version?: string;
			hash?: string;
			link?: string;
		},
		commitHash?: string;
		appVersion?: string;
		vcsBranch?: string;
		allowServiceCalls?: boolean;
	}

	interface StartTestPackResult {
		deviceAccessToken: string;
		tokenValidUntil: string;
		testPackRunId: string;
		testPack: {
			name: string;
			models: Array<{
				modelId: string;
				firmware: string;
			}>,
			devices: Array<{deviceId: string}>;
		}
	}

	type OpenSessionOptions = {
		username: string;
		password: string;
		orgId: string;
	} | {
		sessionToken: string;
	} | {
		accessTokenKey: string;
		accessTokenPassword: string;
	}

	interface OpenSessionResult {
		deviceAccessToken: string;
		tokenValidUntil: string;
	}

	interface StartTestOptions {
		name?: string;
		description?: string;
	}

	interface ConfigureOptions {
		logLevel?: 'silent'|'normal'|'verbose'|'debug'|'silly';
		disallowCrashReports?: boolean;
		continueOnFatalError?: boolean;
		defaultTimeout?: number;
	}

	interface ResponseError {
		errorType: string;
	}

	interface Context {
		context: symbol;
		setContext(context: symbol): void;
		clear(): void;
	}

	interface AuthContext {
		headers: object;
		tokenKey: string;

		setContext(newContext: symbol, tokenId: string|undefined, tokenPassword: string|undefined): void;
		clear(): void;
		authorizeHttp(requestKey: string, requestObject: object, errorOptions: SuitestErrorOptions): Promise<SuitestError|object>;
		authorizeWs(contentObject: object, commandName: string): Promise<SuitestError|object>;
		authorizeWsConnection(connectObject: object, commandName: string): Promise<SuitestError|object>;
		getToken(): string;
	}

	interface SuitestErrorOptions {
		commandName?: string;
		type?: string;
	}

	interface SuitestError extends Error {}

	interface ElementSelector {
		apiId?: string;
		css?: string,
		xpath?: string,
		attributes?: string,
		text?: string,
		position?: string,
		size?: string,
		color?: string,
		index?: number,
		video?: true,
	}
}
