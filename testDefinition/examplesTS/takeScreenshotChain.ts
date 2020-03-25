import * as suitest from '../../index';

const {takeScreenshot} = suitest;

// should have all necessary modifiers
const takeScreenshotChain = takeScreenshot();

takeScreenshotChain.toString();
takeScreenshotChain.then((buffer: Buffer) => {
	console.log(buffer.entries());
});
takeScreenshot('raw').then((buffer: Buffer) => {
	console.log(buffer.entries());
});
takeScreenshot('base64').then((base64String: string) => {
	console.log(base64String);
});
takeScreenshotChain.abandon();

// should have only toString method
const abandonedTakeScreenshot = takeScreenshot().abandon();

abandonedTakeScreenshot.toString();
