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
import {RunTestChain} from './typeDefinition/RunTestChain';
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
import {Directions} from './typeDefinition/constants/directions';
import {TapTypes} from './typeDefinition/constants/tapTypes';
import {ReplOptions} from './typeDefinition/InteractiveCommandChain';
import {ImageLoadState} from './typeDefinition/constants/ImageLoadState';
import {PlayStationVideoChain} from './typeDefinition/PlayStationVideoChain';
import {HadNoError} from './typeDefinition/constants/HadNoError';
import {TakeScreenshotChain} from './typeDefinition/TakeScreenshotChain';
import {SetScreenOrientationChain} from './typeDefinition/SetScreenOrientationChain';
import {ScreenOrientation} from './typeDefinition/constants/ScreenOrientation';
import {CloseAppChain} from './typeDefinition/CloseAppChain';
import {SuspendAppChain} from './typeDefinition/SuspendAppChain';
import {RelativePosition} from './typeDefinition/RelativePositionChain';
import {LaunchMode} from './typeDefinition/constants/LaunchMode';
import {OpenDeepLinkChain} from './typeDefinition/OpenDeepLink';
import {CookieProp} from './typeDefinition/constants/CookieProp';
import {OcrChain} from './typeDefinition/OcrChain';
import {OcrReadAs} from './typeDefinition/constants/OcrReadAs';
import {StringPropComparators} from './typeDefinition/constants/PropComparators';
import {ValueOf} from './typeDefinition/utils';
import {OcrColor} from './typeDefinition/constants/OcrColor';
import {ImageChain} from './typeDefinition/ImageChain';
import {Accuracy} from './typeDefinition/constants/Accuracy';
import {Lang} from './typeDefinition/constants/Langs';
import {GetLastVTScreenshotChain} from './typeDefinition/GetLastVTScreenshotChain';

// --------------- Suitest Interface ---------------------- //

declare var suitest: suitest.ISuitest;

export = suitest;

declare namespace suitest {
	export interface ISuitestBase extends NodeJS.EventEmitter {
		/**
		 * @throws {SuitestError}
		 */
		openSession(options: OpenSessionOptions): Promise<OpenSessionResult>;
		/**
		 * @throws {SuitestError}
		 */
		closeSession(): Promise<void>;
		/**
		 * @throws {SuitestError}
		 */
		setAppConfig(configId: string, options?: ConfigOverride): Promise<void>;
		/**
		 * @throws {SuitestError}
		 */
		pairDevice(deviceId: string, recordingSettings?: {recording?: 'autostart' | 'manualstart' | 'none', webhookUrl?: string}): Promise<DeviceData>;
		/**
		 * @throws {SuitestError}
		 */
		releaseDevice(): Promise<void>;
		startREPL(options?: ReplOptions): Promise<void>;
		/**
		 * @throws {SuitestError}
		 */
		getAppConfig(): Promise<AppConfiguration>;
		/**
		 * @throws {SuitestError}
		 */
		startRecording({webhookUrl}?: {webhookUrl: string}): Promise<string | undefined>;
		/**
		 * @throws {SuitestError}
		 */
		stopRecording({discard}?: {discard: boolean}): Promise<void>;

		// config
		getConfig(): ConfigureOptions;
		setDefaultTimeout(timeout: ConfigureOptions['defaultTimeout']): void;
		setContinueOnFatalError(continueOnFatalError: ConfigureOptions['continueOnFatalError']): void;
		setDisallowCrashReports(disallowCrashReports: ConfigureOptions['disallowCrashReports']): void;
		setLogLevel(logLevel: ConfigureOptions['logLevel']): void;
		setRecordingOption(recordingOption: ConfigureOptions['recordingOption']): void;
		setWebhookUrl(webhookUrl: ConfigureOptions['webhookUrl']): void;

		// subjects
		location(): LocationChain;
		application(): ApplicationChain;
		clearAppData(): ClearAppDataChain;
		cookie(cookieName: string): CookieChain;
		element(elementSelector: ElementSelector[] | ElementSelector | string): ElementChain;
		video(): VideoChain;
		psVideo(): PlayStationVideoChain;
		executeCommand(jsCode: string): ExecuteCommandChain;
		executeCommand(jsCode: Function): ExecuteCommandChain;
		jsExpression(expression: string): JsExpressionChain;
		jsExpression(expression: Function): JsExpressionChain;
		// executeBrightScript(brsCode: string): ExecuteBrightScriptChain;
		// brightScriptExpression(expression: string): BrightScriptExpressionChain;
		openApp(relativeUrl?: string): OpenAppChain;
		closeApp(): CloseAppChain;
		suspendApp(): SuspendAppChain;
		networkRequest(): NetworkRequestChain;
		openUrl(absoluteUrl: string): OpenUrlChain;
		pollUrl(url: string, response: string): PollUrlChain;
		position(x: number, y: number): PositionChain;
		relativePosition(x: number, y: number): RelativePosition;
		press(key: string, options?: { longPressMs?: string | number }): PressButtonChain;
		press(keys: string[], options?: { longPressMs?: string | number }): PressButtonChain;
		sleep(milliseconds: number): SleepChain;
		window(): WindowChain;
		setScreenOrientation(orientation: ScreenOrientationValues): SetScreenOrientationChain;
		/**
		 * @description return PromiseLike object with Buffer as value which represents latest screenshot made for visual testing/assertions
		 */
		takeScreenshot(dataFormat?: 'raw'): TakeScreenshotChain<Buffer>;
		/**
		 * @description return PromiseLike object with base64 string as value which represents latest screenshot made for visual testing/assertions
		 */
		takeScreenshot(dataFormat: 'base64'): TakeScreenshotChain<string>;
		/**
		 * @description the complete path to the file name where the screenshot should be saved.
		 *  Can be defined as string with placeholders, for example default path
		 *  to screenshots folder looks like {screenshotDir}/{dateTime}-{currentFile}-l{currentLine}.png.
		 *  Available placeholders:
		 *  - screenshotDir - default value is "screenshots"
		 *  - dateTime - time when saving screenshot happens in YYYY-MM-DD-HH-mm-ss-SSS format
		 *  - currentFile - file where saving screenshot requested
		 *  - currentLine - line of code where saving screenshot requested
		 * @example
		 * suitest.saveScreenshot('/path/to/file.png');
		 * suitest.saveScreenshot('{screenshotDir}/{dateTime}-{currentFile}-l{currentLine}.png');
		 */
		saveScreenshot(fileName?: string): TakeScreenshotChain<void>;
		/**
		 * @description returns a screenshot taken with a previous visual testing assertion (OCR or image assertions). Screenshot data will be provided as a Buffer.
		 */
		getLastVTScreenshot(dataFormat?: 'raw'): GetLastVTScreenshotChain<Buffer>;
		/**
		 * @description returns a screenshot taken with a previous visual testing assertion (OCR or image assertions). Screenshot data will be provided as a base64 encoded string.
		 */
		getLastVTScreenshot(dataFormat: 'base64'): GetLastVTScreenshotChain<string>;
		openDeepLink(deepLink?: string): OpenDeepLinkChain;
		ocr(comparators: OcrCommonItem[]): OcrChain;
		image(imageData: ImageData): ImageChain;
		image(apiId: string): ImageChain;

		getPairedDevice(): null | {
			deviceId: string,
			manufacturer: string,
			model: string,
			owner: string,
			firmware: string,
			modelId: string,
			platforms: string[],
			customName?: string,
			inactivityTimeout?: number,
			status: string,
			displayName?: string,
			shortDisplayName?: string,
		}

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
		HAD_NO_ERROR: HadNoError;
		TAP_TYPES: TapTypes;
		DIRECTIONS: Directions;
		SCREEN_ORIENTATION: ScreenOrientation;
		LAUNCH_MODE: LaunchMode;
		COOKIE_PROP: CookieProp;
		OCR_READ_AS: OcrReadAs;
		OCR_COLOR: OcrColor;
		ACCURACY: Accuracy;
		LANG: Lang;

		authContext: AuthContext;
		appContext: Context;
		pairedDeviceContext: Context;

		on(eventName: 'consoleLog', listener: (consoleLog: ConsoleLogEvent) => void): this;
		on(eventName: 'networkLog', listener: (networkLog: NetworkLogEvent) => void): this;
		once(eventName: 'consoleLog', listener: (consoleLog: ConsoleLogEvent) => void): this;
		once(eventName: 'networkLog', listener: (networkLog: NetworkLogEvent) => void): this;
		off(eventName: 'consoleLog', listener: (consoleLog: ConsoleLogEvent) => void): this;
		off(eventName: 'networkLog', listener: (networkLog: NetworkLogEvent) => void): this;
	}

	export interface ISuitest extends ISuitestBase {
		assert: AssertChains;
	}

	interface AssertChains {
		location(): LocationChain;
		application(): ApplicationChain;
		clearAppData(): ClearAppDataChain;
		cookie(cookieName: string): CookieChain;
		element(elementSelector: ElementSelector[] | ElementSelector | string): Omit<ElementChain, 'getCssProperties' | 'handle' | 'getAttributes'>;
		video(): VideoChain;
		psVideo(): PlayStationVideoChain;
		executeCommand(jsCode: string): ExecuteCommandChain;
		executeCommand(jsCode: Function): ExecuteCommandChain;
		jsExpression(expression: string): JsExpressionChain;
		jsExpression(expression: Function): JsExpressionChain;
		// executeBrightScript(brsCode: string): ExecuteBrightScriptChain;
		// brightScriptExpression(expression: string): BrightScriptExpressionChain;
		openApp(relativeUrl?: string): OpenAppChain;
		closeApp(): CloseAppChain;
		suspendApp(): SuspendAppChain;
		networkRequest(): NetworkRequestChain;
		openUrl(absoluteUrl: string): OpenUrlChain;
		pollUrl(url: string, response: string): PollUrlChain;
		position(x: number, y: number): PositionChain;
		relativePosition(x: number, y: number): RelativePosition;
		press(key: string, options?: { longPressMs?: string | number }): PressButtonChain;
		press(keys: string[], options?: { longPressMs?: string | number }): PressButtonChain;
		runTest(testId: string): RunTestChain;
		sleep(milliseconds: number): SleepChain;
		window(): WindowChain;
		setScreenOrientation(orientation: ScreenOrientationValues): SetScreenOrientationChain;
		openDeepLink(deepLink?: string): OpenDeepLinkChain;
		ocr(comparators: OcrCommonItem[]): OcrChain;
		image(imageData: ImageData): ImageChain;
		image(apiId: string): ImageChain;
	}

	type NetworkLogEvent = {
		type: 'networkLog',
		requestId: string,
		section: 'request',
		request: {
			headers: {[key: string]: string[]},
			method: 'GET' | 'HEAD' |'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH',
			time: number,
			uri: string,
		},
	} | {
		type: 'networkLog',
		requestId: string,
		section: 'response',
		response: {
			headers: {[key: string]: string[]},
			statusCode: number,
			startTime: number,
			finishTime: number,
			responseSize: number,
			frozen: boolean,
			requestBody: string,
			responseBody: string,
		},
	}
	type ConsoleLogEvent = {
		type: 'consoleLog',
		level: string,
		data: any[],
	}

	interface DeviceData {
		id: string;
		firmware: string;
		modelId: string;
		recordingUrl?: string;
	}

	interface ConfigOverride {
		url?: string;
		suitestify?: boolean;
		domainList?: string[];
		mapRules?: Array<{
			methods: string[];
			url: string;
			type: string;
			toUrl: string;
		}>;
		codeOverrides?: object;
		configVariables?: Array<{
			key: string;
			value: string;
		}>;
		openAppOverrideTest?: string;
		[key: string]: any; // user should have ability to pass any property to config object
	}

	type OpenSessionOptions = {
		tokenId: string;
		tokenPassword: string;
	}

	interface OpenSessionResult {
		accessToken: string;
	}

	interface AppConfiguration {
		name: string;
		url: string;
		suitestify: boolean;
		domainList: string[];
		variables: Record<string, string>;
		platform: string;
		isHtmlBased: boolean;
	}

	interface ConfigureOptions {
		logLevel: 'silent'|'normal'|'verbose'|'debug'|'silly';
		recordingOption: 'autostart'|'manualstart'|'none';
		webhookUrl: string;
		disallowCrashReports: boolean;
		continueOnFatalError: boolean;
		defaultTimeout: number;
	}

	interface Context {
		context: unknown;
		setContext(context: unknown): void;
		clear(): void;
	}

	interface AuthContext {
		headers: Record<string, string>;
		tokenKey: string;

		setContext(newContext: symbol, tokenId: string|undefined, tokenPassword: string|undefined): void;
		clear(): void;

		/**
		 * @throws {SuitestError}
		 */
		authorizeHttp<T extends object>(requestkey: string, requestObject: T, errorOptions?: SuitestErrorOptions): Promise<WithHeaders<T>>;
		/**
		 * @throws {SuitestError}
		 */
		authorizeWs<T extends object>(contentObject: T, commandName: string): Promise<T>;
		/**
		 * @throws {SuitestError}
		 */
		authorizeWsConnection<T extends object>(connectObject: T, commandName: string): Promise<WithHeaders<T>>;
		getToken(): string;
	}

	type WithHeaders<T extends object> = T & {
		headers: Record<string, string>
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
		handle?: string,
		attributes?: string,
		text?: string,
		linkText?: string,
		partialLinkText?: string,
		position?: string,
		size?: string,
		color?: string,
		index?: number,
		active?: true,
	}

	type ScreenOrientationValues =
		| 'portrait'
		| 'portraitReversed'
		| 'landscape'
		| 'landscapeReversed';

	type OcrCommonItem = {
		val: string,
		type?: StringPropComparators,
		readAs?: ValueOf<OcrReadAs>,
		align?: boolean,
		color?: ValueOf<OcrColor>,
		whitelist?: string,
		blacklist?: string,
		region?: [left: number, top: number, width: number, height: number],
	}

	type ImageData =
		| {
			// image api id from suitest image repository
			apiId: string,
		}
		| {
			// url to image somewhere in internet
			url: string,
		}
		| {
			// os path to image somewhere on a disc
			filepath: string,
		}

}
