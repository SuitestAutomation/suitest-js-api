import * as suitest from '../../index';

const {getLastVTScreenshot} = suitest;

// should have all necessary modifiers
const takeScreenshotChain = getLastVTScreenshot();

takeScreenshotChain.toString();
takeScreenshotChain.then((buffer: Buffer) => {
	console.log(buffer.entries());
});
getLastVTScreenshot('raw').then((buffer: Buffer) => {
	console.log(buffer.entries());
});
getLastVTScreenshot('base64').then((base64String: string) => {
	console.log(base64String);
});
takeScreenshotChain.abandon();

// should have only toString method
const abandonedTakeScreenshot = getLastVTScreenshot().abandon();

abandonedTakeScreenshot.toString();
