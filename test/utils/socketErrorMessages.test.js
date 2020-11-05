/* eslint-disable max-len */

const assert = require('assert');
const {EOL} = require('os');
const chainUtils = require('../../lib/utils/chainUtils');
const sinon = require('sinon');
const {
	getErrorMessage,
	getInfoErrorMessage,
	responseMessageCode,
	responseMessageInfo,
	getSnippetLogs,
} = require('../../lib/utils/socketErrorMessages');

describe('Socket error messages', () => {

	it('test response message getters', () => {
		assert.equal(responseMessageInfo({message: {info: 'test'}}), 'test');
		assert.equal(responseMessageCode({message: {code: 'test'}}), 'test');
	});

	it('getErrorMessage should use verbose level', () => {
		const stub = sinon.stub(chainUtils, 'translateLineResult');

		getErrorMessage({response: {}, jsonMessage: {}, verbosity: 'normal'});
		chainUtils.translateLineResult.restore();
		assert.strictEqual(stub.firstCall.args[1], 'silly');
	});

	it('Error message getter should fails', () => {
		assert.throws(getErrorMessage);
		assert.throws(() => getErrorMessage({}));
	});

	it('should test getInfoErrorMessage', () => {
		const msg1 = getInfoErrorMessage(
			'message',
			'prefix ',
			{errorType: 'testIsNotStarted'},
			'stack\n\tat line1\n\tat line2').replace(/\r/gm, '');

		assert.strictEqual(
			msg1,
			'prefix message Test session will now close and all remaining Suitest commands will fail. To allow execution of remaining Suitest commands call suitest.startTest() or fix this error.\n\tat line1',
		);

		const msg2 = getInfoErrorMessage('message', 'prefix ', {
			result: 'fatal',
		}, 'stack\n\tat line1\n\tat line2').replace(/\r/gm, '');

		assert.strictEqual(
			msg2,
			'prefix message Test session will now close and all remaining Suitest commands will fail. To allow execution of remaining Suitest commands call suitest.startTest() or fix this error.\n\tat line1',
		);

		const msg3 = getInfoErrorMessage(
			'message',
			'prefix ',
			{},
			'stack\n\tat line1\n\tat line2',
		).replace(/\r/gm, '');

		assert.strictEqual(msg3, 'prefix message\n\tat line1');

		const msg4 = getInfoErrorMessage(
			'message' + EOL,
			'prefix ',
			{},
			'stack\n\tat line1\n\tat line2',
		);

		assert.strictEqual(msg4, 'prefix message' + EOL + '\tat line1');
	});

	it('getSnippetLogs Should produce correct output with simple line', () => {
		const translateFn = (...args) => JSON.stringify(...args);
		const payload = {'verbosity': 'debug', 'definitions': {'69c27f99-7b59-407f-b0e9-38244fd3a006': [{'lineId': '7e4785b4-8817-4550-8a84-cf93dd1bd0f6', 'type': 'sleep', 'excluded': false, 'timeout': 2000}, {'lineId': '8ddea4de-998b-44b8-804b-6700239e8140', 'type': 'sleep', 'excluded': false, 'timeout': 2000}, {'lineId': 'f34f1755-7dc0-4bbc-8582-33ae53dcb93a', 'type': 'sleep', 'excluded': false, 'timeout': 2000}]}, 'results': [{'result': 'success', 'lineId': '2-1', 'timeStarted': 1603807564404, 'timeFinished': 1603807566405, 'timeHrDiff': [2, 710622], 'timeScreenshotHr': [0, 0]}, {'result': 'success', 'lineId': '2-2', 'timeStarted': 1603807566405, 'timeFinished': 1603807568406, 'timeHrDiff': [2, 525453], 'timeScreenshotHr': [0, 0]}, {'result': 'success', 'lineId': '2-3', 'timeStarted': 1603807568407, 'timeFinished': 1603807570407, 'timeHrDiff': [2, 344593], 'timeScreenshotHr': [0, 0]}], 'testId': '69c27f99-7b59-407f-b0e9-38244fd3a006', 'level': 1};
		const expectedOutput = '\t{"lineId":"7e4785b4-8817-4550-8a84-cf93dd1bd0f6","type":"sleep","excluded":false,"timeout":2000}\n' +
			'\t{"lineId":"8ddea4de-998b-44b8-804b-6700239e8140","type":"sleep","excluded":false,"timeout":2000}\n' +
			'\t{"lineId":"f34f1755-7dc0-4bbc-8582-33ae53dcb93a","type":"sleep","excluded":false,"timeout":2000}';

		assert.deepStrictEqual(getSnippetLogs(payload, translateFn), expectedOutput);
	});

	it('getSnippetLogs Should produce correct output with snippet', () => {
		const translateFn = (...args) => JSON.stringify(...args);
		const payload = {'verbosity': 'debug', 'definitions': {'424489ab-240a-4524-ae42-be1cd41a4912': [{'type': 'openApp', 'lineId': '0c54e7ec-78e5-411f-925c-d0dac9636e28'}, {'lineId': '504d5ab6-2d4d-44f8-ad65-07191ef1316a', 'type': 'runSnippet', 'excluded': false, 'val': '20330172-c45d-4917-9af6-c49b971c0d32', 'tasks': [{'type': 'openApp', 'lineId': '20b73343-e6ab-4120-80ad-60e8376b9c71'}, {'lineId': '1522d5dd-42ea-4466-bd52-3190026a0624', 'type': 'sleep', 'excluded': false, 'timeout': 2000}], 'definitionVersion': 2, 'count': 1}], '20330172-c45d-4917-9af6-c49b971c0d32': [{'lineId': '1522d5dd-42ea-4466-bd52-3190026a0624', 'type': 'sleep', 'excluded': false, 'timeout': 2000}, {'lineId': '0fbd016f-a7c4-45a9-9a39-0d7f0f3efbfe', 'type': 'wait', 'excluded': false, 'condition': {'subject': {'type': 'element', 'elementId': '1d05e97a-424c-40fa-acbe-1b803db7562e', 'name': 'Folder (All files) focused'}, 'type': 'has', 'expression': [{'property': 'backgroundColor', 'type': '=', 'inherited': true, 'val': 'rgba(0, 0, 0, 0)', 'uid': 'c257ee7a-f920-471a-996f-07360c65ca8f'}, {'property': 'borderColor', 'type': '=', 'inherited': true, 'val': 'rgba(20, 23, 176, 1)', 'uid': '87057927-a5c0-4949-885e-2f4a0ffeb185'}, {'property': 'borderStyle', 'type': '=', 'inherited': true, 'val': 'solid', 'uid': 'fb69b622-dfd7-437b-89ef-eadf8d915ebb'}, {'property': 'borderWidth', 'type': '=', 'inherited': true, 'val': '2px', 'uid': '51193d1f-f242-4633-b7eb-fef060352935'}, {'property': 'class', 'type': '=', 'inherited': true, 'val': 'widget container button item folder folder-main folder-all listitem active focus buttonFocussed', 'uid': 'ad9e2dcb-c40d-4dd9-a605-8784266c45e7'}, {'property': 'height', 'type': '=', 'inherited': true, 'val': 128, 'uid': '1111161d-13b0-41dd-b8e0-16dc62f136da'}, {'property': 'href', 'type': '=', 'inherited': true, 'val': '', 'uid': '5df8cd08-852c-40e1-9ba5-b8f78962e807'}, {'property': 'id', 'type': '=', 'inherited': true, 'val': 'allFolderButton', 'uid': 'b6165dea-c4ce-4cc1-aac2-ff351d82478c'}, {'property': 'image', 'type': '=', 'inherited': true, 'val': '', 'uid': 'ea5f8dfb-13ea-4618-b38e-3872697d0fe4'}, {'property': 'left', 'type': '=', 'inherited': true, 'val': 31, 'uid': 'fee4b83c-84df-4ca7-9491-58d26d087f1d'}, {'property': 'opacity', 'type': '=', 'inherited': true, 'val': 1, 'uid': '3f5bcb54-88c1-46bf-8caa-0cfddc552246'}, {'property': 'color', 'type': '=', 'inherited': true, 'val': 'rgba(255, 255, 255, 1)', 'uid': '77d09dca-12e6-47fe-b00f-5721ee4605a9'}, {'property': 'text', 'type': '=', 'inherited': true, 'val': 'All Files', 'uid': '147f05da-0d4a-4291-84e1-8ac5a2170884'}, {'property': 'top', 'type': '=', 'inherited': true, 'val': 165, 'uid': '230a1bc7-4cda-41c7-be99-323a6c3a55cd'}, {'property': 'width', 'type': '=', 'inherited': true, 'val': 166, 'uid': '957b8967-2c74-4c59-8a35-3a13abb4d371'}, {'property': 'zIndex', 'type': '=', 'inherited': true, 'val': 0, 'uid': '06b335fd-352b-469f-8ee3-096e9d4414fd'}]}, 'then': 'success', 'timeout': 10000}]}, 'results': [{'result': 'fail', 'results': [{'result': 'success', 'lineId': '2-2-1', 'timeStarted': 1603806943812, 'timeFinished': 1603806945812, 'timeHrDiff': [2, 522470], 'timeScreenshotHr': [0, 0]}, {'result': 'fail', 'errorType': 'queryFailed', 'message': {'code': 'missingSubject', 'info': {}}, 'lineId': '2-2-2', 'timeStarted': 1603806945813, 'timeFinished': 1603806955814, 'timeHrDiff': [10, 1639519], 'timeScreenshotHr': [0, 0]}], 'lineId': '2-2', 'timeStarted': 1603806943812, 'timeFinished': 1603806955815, 'timeHrDiff': [12, 2588583], 'timeScreenshotHr': [0, 0]}], 'testId': '424489ab-240a-4524-ae42-be1cd41a4912', 'level': 1};
		const expectedOutput = '\t{"type":"openApp","lineId":"0c54e7ec-78e5-411f-925c-d0dac9636e28"}\n' +
			'\t{"lineId":"504d5ab6-2d4d-44f8-ad65-07191ef1316a","type":"runSnippet","excluded":false,"val":"20330172-c45d-4917-9af6-c49b971c0d32","tasks":[{"type":"openApp","lineId":"20b73343-e6ab-4120-80ad-60e8376b9c71"},{"lineId":"1522d5dd-42ea-4466-bd52-3190026a0624","type":"sleep","excluded":false,"timeout":2000}],"definitionVersion":2,"count":1}\n' +
			'\t\t{"lineId":"1522d5dd-42ea-4466-bd52-3190026a0624","type":"sleep","excluded":false,"timeout":2000}\n' +
			'\t\t{"lineId":"0fbd016f-a7c4-45a9-9a39-0d7f0f3efbfe","type":"wait","excluded":false,"condition":{"subject":{"type":"element","elementId":"1d05e97a-424c-40fa-acbe-1b803db7562e","name":"Folder (All files) focused"},"type":"has","expression":[{"property":"backgroundColor","type":"=","inherited":true,"val":"rgba(0, 0, 0, 0)","uid":"c257ee7a-f920-471a-996f-07360c65ca8f"},{"property":"borderColor","type":"=","inherited":true,"val":"rgba(20, 23, 176, 1)","uid":"87057927-a5c0-4949-885e-2f4a0ffeb185"},{"property":"borderStyle","type":"=","inherited":true,"val":"solid","uid":"fb69b622-dfd7-437b-89ef-eadf8d915ebb"},{"property":"borderWidth","type":"=","inherited":true,"val":"2px","uid":"51193d1f-f242-4633-b7eb-fef060352935"},{"property":"class","type":"=","inherited":true,"val":"widget container button item folder folder-main folder-all listitem active focus buttonFocussed","uid":"ad9e2dcb-c40d-4dd9-a605-8784266c45e7"},{"property":"height","type":"=","inherited":true,"val":128,"uid":"1111161d-13b0-41dd-b8e0-16dc62f136da"},{"property":"href","type":"=","inherited":true,"val":"","uid":"5df8cd08-852c-40e1-9ba5-b8f78962e807"},{"property":"id","type":"=","inherited":true,"val":"allFolderButton","uid":"b6165dea-c4ce-4cc1-aac2-ff351d82478c"},{"property":"image","type":"=","inherited":true,"val":"","uid":"ea5f8dfb-13ea-4618-b38e-3872697d0fe4"},{"property":"left","type":"=","inherited":true,"val":31,"uid":"fee4b83c-84df-4ca7-9491-58d26d087f1d"},{"property":"opacity","type":"=","inherited":true,"val":1,"uid":"3f5bcb54-88c1-46bf-8caa-0cfddc552246"},{"property":"color","type":"=","inherited":true,"val":"rgba(255, 255, 255, 1)","uid":"77d09dca-12e6-47fe-b00f-5721ee4605a9"},{"property":"text","type":"=","inherited":true,"val":"All Files","uid":"147f05da-0d4a-4291-84e1-8ac5a2170884"},{"property":"top","type":"=","inherited":true,"val":165,"uid":"230a1bc7-4cda-41c7-be99-323a6c3a55cd"},{"property":"width","type":"=","inherited":true,"val":166,"uid":"957b8967-2c74-4c59-8a35-3a13abb4d371"},{"property":"zIndex","type":"=","inherited":true,"val":0,"uid":"06b335fd-352b-469f-8ee3-096e9d4414fd"}]},"then":"success","timeout":10000}';

		assert.deepStrictEqual(getSnippetLogs(payload, translateFn), expectedOutput);
	});

	it('getSnippetLogs Should produce correct output with loops', () => {
		const translateFn = (...args) => JSON.stringify(...args);
		const payload = {'verbosity': 'debug', 'definitions': {'424489ab-240a-4524-ae42-be1cd41a4912': [{'type': 'openApp', 'lineId': '0c54e7ec-78e5-411f-925c-d0dac9636e28'}, {'lineId': '504d5ab6-2d4d-44f8-ad65-07191ef1316a', 'type': 'runSnippet', 'excluded': false, 'val': '20330172-c45d-4917-9af6-c49b971c0d32', 'tasks': [{'type': 'openApp', 'lineId': '20b73343-e6ab-4120-80ad-60e8376b9c71'}, {'lineId': '1522d5dd-42ea-4466-bd52-3190026a0624', 'type': 'sleep', 'excluded': false, 'timeout': 2000}], 'definitionVersion': 2, 'count': 3}], '20330172-c45d-4917-9af6-c49b971c0d32': [{'lineId': '1522d5dd-42ea-4466-bd52-3190026a0624', 'type': 'sleep', 'excluded': false, 'timeout': 2000}, {'lineId': '0fbd016f-a7c4-45a9-9a39-0d7f0f3efbfe', 'type': 'wait', 'excluded': false, 'condition': {'subject': {'type': 'element', 'elementId': '1d05e97a-424c-40fa-acbe-1b803db7562e', 'name': 'Folder (All files) focused'}, 'type': 'has', 'expression': [{'property': 'backgroundColor', 'type': '=', 'inherited': true, 'val': 'rgba(0, 0, 0, 0)', 'uid': 'c257ee7a-f920-471a-996f-07360c65ca8f'}, {'property': 'borderColor', 'type': '=', 'inherited': true, 'val': 'rgba(20, 23, 176, 1)', 'uid': '87057927-a5c0-4949-885e-2f4a0ffeb185'}, {'property': 'borderStyle', 'type': '=', 'inherited': true, 'val': 'solid', 'uid': 'fb69b622-dfd7-437b-89ef-eadf8d915ebb'}, {'property': 'borderWidth', 'type': '=', 'inherited': true, 'val': '2px', 'uid': '51193d1f-f242-4633-b7eb-fef060352935'}, {'property': 'class', 'type': '=', 'inherited': true, 'val': 'widget container button item folder folder-main folder-all listitem active focus buttonFocussed', 'uid': 'ad9e2dcb-c40d-4dd9-a605-8784266c45e7'}, {'property': 'height', 'type': '=', 'inherited': true, 'val': 128, 'uid': '1111161d-13b0-41dd-b8e0-16dc62f136da'}, {'property': 'href', 'type': '=', 'inherited': true, 'val': '', 'uid': '5df8cd08-852c-40e1-9ba5-b8f78962e807'}, {'property': 'id', 'type': '=', 'inherited': true, 'val': 'allFolderButton', 'uid': 'b6165dea-c4ce-4cc1-aac2-ff351d82478c'}, {'property': 'image', 'type': '=', 'inherited': true, 'val': '', 'uid': 'ea5f8dfb-13ea-4618-b38e-3872697d0fe4'}, {'property': 'left', 'type': '=', 'inherited': true, 'val': 31, 'uid': 'fee4b83c-84df-4ca7-9491-58d26d087f1d'}, {'property': 'opacity', 'type': '=', 'inherited': true, 'val': 1, 'uid': '3f5bcb54-88c1-46bf-8caa-0cfddc552246'}, {'property': 'color', 'type': '=', 'inherited': true, 'val': 'rgba(255, 255, 255, 1)', 'uid': '77d09dca-12e6-47fe-b00f-5721ee4605a9'}, {'property': 'text', 'type': '=', 'inherited': true, 'val': 'All Files', 'uid': '147f05da-0d4a-4291-84e1-8ac5a2170884'}, {'property': 'top', 'type': '=', 'inherited': true, 'val': 165, 'uid': '230a1bc7-4cda-41c7-be99-323a6c3a55cd'}, {'property': 'width', 'type': '=', 'inherited': true, 'val': 166, 'uid': '957b8967-2c74-4c59-8a35-3a13abb4d371'}, {'property': 'zIndex', 'type': '=', 'inherited': true, 'val': 0, 'uid': '06b335fd-352b-469f-8ee3-096e9d4414fd'}]}, 'then': 'success', 'timeout': 10000}]}, 'results': [{'result': 'fail', 'loopResults': [{'result': 'fail', 'results': [{'result': 'success', 'lineId': '2-2-1', 'timeStarted': 1603806379665, 'timeFinished': 1603806381666, 'timeHrDiff': [2, 717761], 'timeScreenshotHr': [0, 0]}, {'result': 'fail', 'errorType': 'queryFailed', 'message': {'code': 'missingSubject', 'info': {}}, 'lineId': '2-2-2', 'timeStarted': 1603806381666, 'timeFinished': 1603806391667, 'timeHrDiff': [10, 1074480], 'timeScreenshotHr': [0, 0]}], 'timeStarted': 1603806379665, 'timeFinished': 1603806391668, 'timeHrDiff': [12, 2021472], 'timeScreenshotHr': [0, 0]}, {'result': 'fail', 'results': [{'result': 'success', 'lineId': '2-2-1', 'timeStarted': 1603806391669, 'timeFinished': 1603806393669, 'timeHrDiff': [2, 312851], 'timeScreenshotHr': [0, 0]}, {'result': 'fail', 'errorType': 'queryFailed', 'message': {'code': 'missingSubject', 'info': {}}, 'lineId': '2-2-2', 'timeStarted': 1603806393669, 'timeFinished': 1603806403670, 'timeHrDiff': [10, 1149854], 'timeScreenshotHr': [0, 0]}], 'timeStarted': 1603806391669, 'timeFinished': 1603806403671, 'timeHrDiff': [12, 1517900], 'timeScreenshotHr': [0, 0]}, {'result': 'fail', 'results': [{'result': 'success', 'lineId': '2-2-1', 'timeStarted': 1603806403671, 'timeFinished': 1603806405672, 'timeHrDiff': [2, 762261], 'timeScreenshotHr': [0, 0]}, {'result': 'fail', 'errorType': 'queryFailed', 'message': {'code': 'missingSubject', 'info': {}}, 'lineId': '2-2-2', 'timeStarted': 1603806405672, 'timeFinished': 1603806415674, 'timeHrDiff': [10, 1754955], 'timeScreenshotHr': [0, 0]}], 'timeStarted': 1603806403671, 'timeFinished': 1603806415674, 'timeHrDiff': [12, 2571791], 'timeScreenshotHr': [0, 0]}], 'lineId': '2-2', 'timeStarted': 1603806379665, 'timeFinished': 1603806415675, 'timeHrDiff': [36, 6987600], 'timeScreenshotHr': [0, 0]}], 'testId': '424489ab-240a-4524-ae42-be1cd41a4912', 'level': 1};
		const expectedOutput = '\t{"type":"openApp","lineId":"0c54e7ec-78e5-411f-925c-d0dac9636e28"}\n' +
			'\t{"lineId":"504d5ab6-2d4d-44f8-ad65-07191ef1316a","type":"runSnippet","excluded":false,"val":"20330172-c45d-4917-9af6-c49b971c0d32","tasks":[{"type":"openApp","lineId":"20b73343-e6ab-4120-80ad-60e8376b9c71"},{"lineId":"1522d5dd-42ea-4466-bd52-3190026a0624","type":"sleep","excluded":false,"timeout":2000}],"definitionVersion":2,"count":3}\n' +
			'\t- loop count: 1\n' +
			'\t\t{"lineId":"1522d5dd-42ea-4466-bd52-3190026a0624","type":"sleep","excluded":false,"timeout":2000}\n' +
			'\t\t{"lineId":"0fbd016f-a7c4-45a9-9a39-0d7f0f3efbfe","type":"wait","excluded":false,"condition":{"subject":{"type":"element","elementId":"1d05e97a-424c-40fa-acbe-1b803db7562e","name":"Folder (All files) focused"},"type":"has","expression":[{"property":"backgroundColor","type":"=","inherited":true,"val":"rgba(0, 0, 0, 0)","uid":"c257ee7a-f920-471a-996f-07360c65ca8f"},{"property":"borderColor","type":"=","inherited":true,"val":"rgba(20, 23, 176, 1)","uid":"87057927-a5c0-4949-885e-2f4a0ffeb185"},{"property":"borderStyle","type":"=","inherited":true,"val":"solid","uid":"fb69b622-dfd7-437b-89ef-eadf8d915ebb"},{"property":"borderWidth","type":"=","inherited":true,"val":"2px","uid":"51193d1f-f242-4633-b7eb-fef060352935"},{"property":"class","type":"=","inherited":true,"val":"widget container button item folder folder-main folder-all listitem active focus buttonFocussed","uid":"ad9e2dcb-c40d-4dd9-a605-8784266c45e7"},{"property":"height","type":"=","inherited":true,"val":128,"uid":"1111161d-13b0-41dd-b8e0-16dc62f136da"},{"property":"href","type":"=","inherited":true,"val":"","uid":"5df8cd08-852c-40e1-9ba5-b8f78962e807"},{"property":"id","type":"=","inherited":true,"val":"allFolderButton","uid":"b6165dea-c4ce-4cc1-aac2-ff351d82478c"},{"property":"image","type":"=","inherited":true,"val":"","uid":"ea5f8dfb-13ea-4618-b38e-3872697d0fe4"},{"property":"left","type":"=","inherited":true,"val":31,"uid":"fee4b83c-84df-4ca7-9491-58d26d087f1d"},{"property":"opacity","type":"=","inherited":true,"val":1,"uid":"3f5bcb54-88c1-46bf-8caa-0cfddc552246"},{"property":"color","type":"=","inherited":true,"val":"rgba(255, 255, 255, 1)","uid":"77d09dca-12e6-47fe-b00f-5721ee4605a9"},{"property":"text","type":"=","inherited":true,"val":"All Files","uid":"147f05da-0d4a-4291-84e1-8ac5a2170884"},{"property":"top","type":"=","inherited":true,"val":165,"uid":"230a1bc7-4cda-41c7-be99-323a6c3a55cd"},{"property":"width","type":"=","inherited":true,"val":166,"uid":"957b8967-2c74-4c59-8a35-3a13abb4d371"},{"property":"zIndex","type":"=","inherited":true,"val":0,"uid":"06b335fd-352b-469f-8ee3-096e9d4414fd"}]},"then":"success","timeout":10000}\n' +
			'\t- loop count: 2\n' +
			'\t\t{"lineId":"1522d5dd-42ea-4466-bd52-3190026a0624","type":"sleep","excluded":false,"timeout":2000}\n' +
			'\t\t{"lineId":"0fbd016f-a7c4-45a9-9a39-0d7f0f3efbfe","type":"wait","excluded":false,"condition":{"subject":{"type":"element","elementId":"1d05e97a-424c-40fa-acbe-1b803db7562e","name":"Folder (All files) focused"},"type":"has","expression":[{"property":"backgroundColor","type":"=","inherited":true,"val":"rgba(0, 0, 0, 0)","uid":"c257ee7a-f920-471a-996f-07360c65ca8f"},{"property":"borderColor","type":"=","inherited":true,"val":"rgba(20, 23, 176, 1)","uid":"87057927-a5c0-4949-885e-2f4a0ffeb185"},{"property":"borderStyle","type":"=","inherited":true,"val":"solid","uid":"fb69b622-dfd7-437b-89ef-eadf8d915ebb"},{"property":"borderWidth","type":"=","inherited":true,"val":"2px","uid":"51193d1f-f242-4633-b7eb-fef060352935"},{"property":"class","type":"=","inherited":true,"val":"widget container button item folder folder-main folder-all listitem active focus buttonFocussed","uid":"ad9e2dcb-c40d-4dd9-a605-8784266c45e7"},{"property":"height","type":"=","inherited":true,"val":128,"uid":"1111161d-13b0-41dd-b8e0-16dc62f136da"},{"property":"href","type":"=","inherited":true,"val":"","uid":"5df8cd08-852c-40e1-9ba5-b8f78962e807"},{"property":"id","type":"=","inherited":true,"val":"allFolderButton","uid":"b6165dea-c4ce-4cc1-aac2-ff351d82478c"},{"property":"image","type":"=","inherited":true,"val":"","uid":"ea5f8dfb-13ea-4618-b38e-3872697d0fe4"},{"property":"left","type":"=","inherited":true,"val":31,"uid":"fee4b83c-84df-4ca7-9491-58d26d087f1d"},{"property":"opacity","type":"=","inherited":true,"val":1,"uid":"3f5bcb54-88c1-46bf-8caa-0cfddc552246"},{"property":"color","type":"=","inherited":true,"val":"rgba(255, 255, 255, 1)","uid":"77d09dca-12e6-47fe-b00f-5721ee4605a9"},{"property":"text","type":"=","inherited":true,"val":"All Files","uid":"147f05da-0d4a-4291-84e1-8ac5a2170884"},{"property":"top","type":"=","inherited":true,"val":165,"uid":"230a1bc7-4cda-41c7-be99-323a6c3a55cd"},{"property":"width","type":"=","inherited":true,"val":166,"uid":"957b8967-2c74-4c59-8a35-3a13abb4d371"},{"property":"zIndex","type":"=","inherited":true,"val":0,"uid":"06b335fd-352b-469f-8ee3-096e9d4414fd"}]},"then":"success","timeout":10000}\n' +
			'\t- loop count: 3\n' +
			'\t\t{"lineId":"1522d5dd-42ea-4466-bd52-3190026a0624","type":"sleep","excluded":false,"timeout":2000}\n' +
			'\t\t{"lineId":"0fbd016f-a7c4-45a9-9a39-0d7f0f3efbfe","type":"wait","excluded":false,"condition":{"subject":{"type":"element","elementId":"1d05e97a-424c-40fa-acbe-1b803db7562e","name":"Folder (All files) focused"},"type":"has","expression":[{"property":"backgroundColor","type":"=","inherited":true,"val":"rgba(0, 0, 0, 0)","uid":"c257ee7a-f920-471a-996f-07360c65ca8f"},{"property":"borderColor","type":"=","inherited":true,"val":"rgba(20, 23, 176, 1)","uid":"87057927-a5c0-4949-885e-2f4a0ffeb185"},{"property":"borderStyle","type":"=","inherited":true,"val":"solid","uid":"fb69b622-dfd7-437b-89ef-eadf8d915ebb"},{"property":"borderWidth","type":"=","inherited":true,"val":"2px","uid":"51193d1f-f242-4633-b7eb-fef060352935"},{"property":"class","type":"=","inherited":true,"val":"widget container button item folder folder-main folder-all listitem active focus buttonFocussed","uid":"ad9e2dcb-c40d-4dd9-a605-8784266c45e7"},{"property":"height","type":"=","inherited":true,"val":128,"uid":"1111161d-13b0-41dd-b8e0-16dc62f136da"},{"property":"href","type":"=","inherited":true,"val":"","uid":"5df8cd08-852c-40e1-9ba5-b8f78962e807"},{"property":"id","type":"=","inherited":true,"val":"allFolderButton","uid":"b6165dea-c4ce-4cc1-aac2-ff351d82478c"},{"property":"image","type":"=","inherited":true,"val":"","uid":"ea5f8dfb-13ea-4618-b38e-3872697d0fe4"},{"property":"left","type":"=","inherited":true,"val":31,"uid":"fee4b83c-84df-4ca7-9491-58d26d087f1d"},{"property":"opacity","type":"=","inherited":true,"val":1,"uid":"3f5bcb54-88c1-46bf-8caa-0cfddc552246"},{"property":"color","type":"=","inherited":true,"val":"rgba(255, 255, 255, 1)","uid":"77d09dca-12e6-47fe-b00f-5721ee4605a9"},{"property":"text","type":"=","inherited":true,"val":"All Files","uid":"147f05da-0d4a-4291-84e1-8ac5a2170884"},{"property":"top","type":"=","inherited":true,"val":165,"uid":"230a1bc7-4cda-41c7-be99-323a6c3a55cd"},{"property":"width","type":"=","inherited":true,"val":166,"uid":"957b8967-2c74-4c59-8a35-3a13abb4d371"},{"property":"zIndex","type":"=","inherited":true,"val":0,"uid":"06b335fd-352b-469f-8ee3-096e9d4414fd"}]},"then":"success","timeout":10000}';

		assert.deepStrictEqual(getSnippetLogs(payload, translateFn), expectedOutput);
	});
});
