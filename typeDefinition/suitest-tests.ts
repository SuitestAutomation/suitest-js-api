import * as suitest from '../index'

function testLocationChain() {
	const {location} = suitest;

	// should have all necessary modifiers
	const baseLocation = location();

	baseLocation.not();
	baseLocation.doesNot();
	baseLocation.timeout(10);
	baseLocation.equal('');
	baseLocation.equals('');
	baseLocation.contain('');
	baseLocation.contains('');
	baseLocation.matchJS('');
	baseLocation.matchesJS('');
	baseLocation.startWith('');
	baseLocation.startsWith('');
	baseLocation.endWith('');
	baseLocation.endsWith('');
	baseLocation.clone();
	baseLocation.abandon();
	baseLocation.toString();

	// should have only allowed modifiers after condition started
	const equalLoc = location().equal('');

	equalLoc.not();
	equalLoc.doesNot();
	equalLoc.timeout(10);
	baseLocation.clone();
	baseLocation.abandon();
	equalLoc.toString();

	// should have only allowed modifiers after timeout is set
	const timeoutLoc = location().timeout(10);

	timeoutLoc.not();
	timeoutLoc.doesNot();
	timeoutLoc.equal('');
	timeoutLoc.equals('');
	timeoutLoc.contain('');
	timeoutLoc.contains('');
	timeoutLoc.matchJS('');
	timeoutLoc.matchesJS('');
	timeoutLoc.startWith('');
	timeoutLoc.startsWith('');
	timeoutLoc.endWith('');
	timeoutLoc.endsWith('');
	baseLocation.clone();
	baseLocation.abandon();
	timeoutLoc.toString();

	// should have only allowed modifiers after it is nagated
	const notLoc = location().not();

	notLoc.timeout(10);
	notLoc.equal('');
	notLoc.equals('');
	notLoc.contain('');
	notLoc.contains('');
	notLoc.matchJS('');
	notLoc.matchesJS('');
	notLoc.startWith('');
	notLoc.startsWith('');
	notLoc.endWith('');
	notLoc.endsWith('');
	baseLocation.clone();
	baseLocation.abandon();
	notLoc.toString();

	// should have only toString method
	const abandonedLoc = baseLocation.abandon();

	abandonedLoc.toString();

	// chaining examples
	location().contain('').not().timeout(10);
	location().contain('').timeout(10).not();
	location().not().matchJS(() => true).timeout(10);
	location().not().timeout(10).equal('');
	location().timeout(10).not().endsWith('test');
	location().timeout(10).endWith('test').not();
	location().timeout(10).endWith('test').not().toAssert();

	// getters
	location().it.should.with.times;
	location().should.it.with.times;
	location().with.should.it.times;
	location().times.should.with.it;
}

function testApplicationChain() {
	const {application} = suitest;

	// should have all necessary modifiers
	const baseApp = application();

	baseApp.toString();
	baseApp.then();
	baseApp.clone();
	baseApp.abandon();
	baseApp.hasExited();

	// should have only toString method
	const abandonedApp = application().abandon();

	abandonedApp.toString();

	// should have all methods except hasExited
	const hasExitedApp = application().hasExited();

	hasExitedApp.clone();
	hasExitedApp.then();
	hasExitedApp.abandon();
	hasExitedApp.toString();
	hasExitedApp.toAssert();

	// getters
	baseApp.it.should.with.times;
	baseApp.should.it.with.times;
	baseApp.with.should.it.times;
	baseApp.times.should.with.it;
}

function testClearAppDataChain() {
	const {clearAppData} = suitest;

	// should have all necessary modifiers
	const baseClearAppData = clearAppData();

	baseClearAppData.toString();
	baseClearAppData.then();
	baseClearAppData.abandon();
	baseClearAppData.clone();
	baseClearAppData.toAssert();

	// should have only toString method
	const abandonedClearAppData = clearAppData().abandon();

	abandonedClearAppData.toString();

	// getters
	baseClearAppData.it.should.with.times;
	baseClearAppData.should.it.with.times;
	baseClearAppData.with.should.it.times;
	baseClearAppData.times.should.with.it;
}

function testCookieChain() {
	const {cookie} = suitest;

	// should have all necessary modifiers
	const baseCookie = cookie('cookieName');

	baseCookie.not();
	baseCookie.doesNot();
	baseCookie.exist();
	baseCookie.exists();
	baseCookie.matchJS('');
	baseCookie.matchesJS('');
	baseCookie.equal('');
	baseCookie.equals('');
	baseCookie.contain('');
	baseCookie.contains('');
	baseCookie.startWith('');
	baseCookie.startsWith('');
	baseCookie.endWith('');
	baseCookie.endsWith('');
	baseCookie.timeout(10);
	baseCookie.clone();
	baseCookie.abandon();
	baseCookie.toString();

	// should have only allowed modifiers after condition started
	const evalCookie = cookie('cookieName').equal('test');

	evalCookie.not();
	evalCookie.doesNot();
	evalCookie.timeout(10);
	evalCookie.clone();
	evalCookie.abandon();
	evalCookie.toString();

	// should have only allowed modifiers after timeout is set
	const timeoutCookie = cookie('cookieName').timeout(10);

	timeoutCookie.not();
	timeoutCookie.doesNot();
	timeoutCookie.exist();
	timeoutCookie.exists();
	timeoutCookie.matchJS('');
	timeoutCookie.matchesJS('');
	timeoutCookie.equal('');
	timeoutCookie.equals('');
	timeoutCookie.contain('');
	timeoutCookie.contains('');
	timeoutCookie.startWith('');
	timeoutCookie.startsWith('');
	timeoutCookie.endWith('');
	timeoutCookie.endsWith('');
	timeoutCookie.clone();
	timeoutCookie.abandon();
	timeoutCookie.toString();

	// should have only allowed modifiers after it is nagated
	const notCookie = cookie('cookieName').not();

	notCookie.timeout(10);
	notCookie.equal('');
	notCookie.equals('');
	notCookie.contain('');
	notCookie.contains('');
	notCookie.matchJS('');
	notCookie.matchesJS('');
	notCookie.startWith('');
	notCookie.startsWith('');
	notCookie.endWith('');
	notCookie.endsWith('');
	notCookie.exist();
	notCookie.exists();
	baseCookie.clone();
	baseCookie.abandon();
	notCookie.toString();

	// should have only toString method
	const abandonedCookie = baseCookie.abandon();

	abandonedCookie.toString();

	// chaining exapmples
	cookie('cookieName').contain('').not().timeout(10);
	cookie('cookieName').exist().timeout(10).not();
	cookie('cookieName').not().matchJS(() => true).timeout(10);
	cookie('cookieName').not().timeout(10).equal('');
	cookie('cookieName').timeout(10).not().endsWith('test');
	cookie('cookieName').timeout(10).endWith('test').not();
	cookie('cookieName').timeout(10).endWith('test').not().toAssert();

	// getters
	cookie('cookieName').it.should.with.times;
	cookie('cookieName').should.it.with.times;
	cookie('cookieName').with.should.it.times;
	cookie('cookieName').times.should.with.it;
}

async function elementTest() {
	await suitest.element({css: '#repo-id'})
		.match(suitest.PROP.WIDTH, 100)
		.timeout(10)
		.not();

	// Check if element's width and height match snapshot from element repo, top position as in repo +- 20px and custom background color
	const element = suitest.element({css: '#repo-id'});

	await element.matches(suitest.PROP.WIDTH);
	await element.matches(suitest.PROP.HEIGHT);
	await element.matches(suitest.PROP.TOP, suitest.VALUE.REPO, suitest.COMP.APPROX, 20);
	await element.matches(suitest.PROP.BG_COLOR, '#F00');

	// Same with object syntax
	await suitest.element({css: '#repo-id'}).matches({
		name: suitest.PROP.WIDTH,
	});
	await suitest.element({css: '#repo-id'}).matches({
		name: suitest.PROP.HEIGHT,
	});
	await suitest.element({css: '#repo-id'}).matches({
		name: suitest.PROP.TOP,
		val: suitest.VALUE.REPO,
		type: suitest.COMP.APPROX,
		deviation: 20,
	});
	await suitest.element({css: '#repo-id'}).matches({
		name: suitest.PROP.BG_COLOR,
		val: '#F00',
	});

	// Same with array syntax
	// User should be able mix'n'match this syntax options
	await suitest
		.element({css: '#repo-id'})
		.matches([
			suitest.PROP.WIDTH,
			suitest.PROP.HEIGHT,
			{
				name: suitest.PROP.TOP,
				val: suitest.VALUE.REPO, // could be omitted
				type: suitest.COMP.APPROX,
				deviation: 20,
			},
			{
				name: suitest.PROP.BG_COLOR,
				val: '#F00',
			},
		]);

	// Alias for repo-only elements - same syntax as matches, except "value" argument is always omitted
	// It's here for better visibility of element repository features
	await suitest
		.element({css: '#repo-id'})
		.matchesRepo([
			{
				name: suitest.PROP.BG_COLOR,
				val: '#F00', // invalid, value is always taken from repo. Use matches for this
			},
			{
				name: suitest.PROP.LEFT,
				type: suitest.COMP.EQUAL,
			},
		]);


	const el = suitest.element({css: '#repo-id'});

	el.timeout(10);
	el.abandon();
	el.matchesJS(() => true);
	el.matchJS('() => true');
	el.not();
	el.doesNot();
	el.exist();
	el.exists();
	el.then();
	el.timeout(10);
	el.toString();
	el.exists().toString();
	el.matchesJS('').toString();
	el.matches(suitest.PROP.ID).toString();
	el.click().toString();
	el.click().repeat(10).interval(2000).toString();
	el.moveTo().toString();
	el.sendText('text').toString();
	el.sendText('text').repeat(10).interval(2000).toString();
	el.sendText('text').repeat(10).interval(2000).toAssert();

	// getters
	el.it.should.with.times;
	el.should.it.with.times;
	el.with.should.it.times;
	el.times.should.with.it;
}

// video should have the same return type as an element subject
async function videoTest() {
	const {video} = suitest;

	video().timeout(10);
	video().abandon();
	video().matchesJS(() => true);
	video().matchJS('() => true');
	video().not();
	video().doesNot();
	video().exist();
	video().exists();
	video().then();
	video().timeout(10);

	await video()
		.match(suitest.PROP.WIDTH, 100)
		.timeout(10)
		.not();

	// Check if video's width and height match snapshot from video repo, top position as in repo +- 20px and custom background color
	const videoEl = suitest.video();

	await videoEl.matches(suitest.PROP.WIDTH);
	await videoEl.matches(suitest.PROP.HEIGHT);
	await videoEl.matches(suitest.PROP.TOP, suitest.VALUE.REPO, suitest.COMP.APPROX, 20);
	await videoEl.matches(suitest.PROP.BG_COLOR, '#F00');

	// Same with object syntax and a single request
	await video().matches(suitest.PROP.WIDTH);
	await video().matches(suitest.PROP.HEIGHT);
	await video().matches(suitest.PROP.TOP, suitest.VALUE.REPO, suitest.COMP.APPROX, 20);
	await video().matches(suitest.PROP.BG_COLOR, '#F00');

	// Same with object syntax
	await suitest.element({css: '#repo-id'}).matches({
		name: suitest.PROP.WIDTH,
	});
	await suitest.element({css: '#repo-id'}).matches({
		name: suitest.PROP.HEIGHT,
	});
	await suitest.element({css: '#repo-id'}).matches({
		name: suitest.PROP.TOP,
		val: suitest.VALUE.REPO,
		type: suitest.COMP.APPROX,
		deviation: 20,
	});
	await suitest.element({css: '#repo-id'}).matches({
		name: suitest.PROP.BG_COLOR,
		val: '#F00',
	});

	// Same with array syntax
	// User should be able mix'n'match this syntax options
	await suitest
		.element({css: '#repo-id'})
		.matches([
			suitest.PROP.WIDTH,
			suitest.PROP.HEIGHT,
			{
				name: suitest.PROP.TOP,
				val: suitest.VALUE.REPO, // could be omitted
				type: suitest.COMP.APPROX,
				deviation: 20,
			},
			{
				name: suitest.PROP.BG_COLOR,
				val: '#F00',
			},
		]);

	// Alias for repo-only elements - same syntax as matches, except "value" argument is always omitted
	// It's here for better visibility of element repository features
	await suitest
		.element({css: '#repo-id'})
		.matchesRepo([
			{
				name: suitest.PROP.BG_COLOR,
				val: '#F00', // invalid, value is always taken from repo. Use matches for this
			},
			{
				name: suitest.PROP.LEFT,
				type: suitest.COMP.EQUAL,
			},
		]);


	video().toString();
	video().exists().toString();
	video().matchesJS('').toString();
	video().matches(suitest.PROP.ID).toString();
	video().click().toString();
	video().click().repeat(10).interval(2000).toString();
	video().moveTo().toString();
	video().sendText('text').toString();
	video().sendText('text').repeat(10).interval(2000).toString();
	video().sendText('text').repeat(10).interval(2000).toAssert();

	// getters
	video().it.should.with.times;
	video().should.it.with.times;
	video().with.should.it.times;
	video().times.should.with.it;
}

async function executeCommandTest() {
	const {executeCommand} = suitest;

	await executeCommand('adasd');
	await executeCommand(() => '');
	await executeCommand((a: string) => a.toLowerCase());

	executeCommand(() => {}).abandon();
	executeCommand(() => {}).then();
	executeCommand(() => {}).clone();
	executeCommand(() => {}).toString();
}

async function jsExpressionTest() {
	const {jsExpression} = suitest;

	// should have all necessary modifiers
	const baseLocation = jsExpression(() => '');

	baseLocation.not();
	baseLocation.doesNot();
	baseLocation.timeout(10);
	baseLocation.equal('');
	baseLocation.equals('');
	baseLocation.contain('');
	baseLocation.contains('');
	baseLocation.startWith('');
	baseLocation.startsWith('');
	baseLocation.endWith('');
	baseLocation.endsWith('');
	baseLocation.clone();
	baseLocation.abandon();
	baseLocation.toString();

	// should have only allowed modifiers after condition started
	const equalLoc = jsExpression(() => '').equal('');

	equalLoc.not();
	equalLoc.doesNot();
	equalLoc.timeout(10);
	baseLocation.clone();
	baseLocation.abandon();
	equalLoc.toString();

	// should have only allowed modifiers after timeout is set
	const timeoutLoc = jsExpression(() => '').timeout(10);

	timeoutLoc.not();
	timeoutLoc.doesNot();
	timeoutLoc.equal('');
	timeoutLoc.equals('');
	timeoutLoc.contain('');
	timeoutLoc.contains('');
	timeoutLoc.startWith('');
	timeoutLoc.startsWith('');
	timeoutLoc.endWith('');
	timeoutLoc.endsWith('');
	baseLocation.clone();
	baseLocation.abandon();
	timeoutLoc.toString();

	// should have only allowed modifiers after it is nagated
	const notLoc = jsExpression(() => '').not();

	notLoc.timeout(10);
	notLoc.equal('');
	notLoc.equals('');
	notLoc.contain('');
	notLoc.contains('');
	notLoc.startWith('');
	notLoc.startsWith('');
	notLoc.endWith('');
	notLoc.endsWith('');
	baseLocation.clone();
	baseLocation.abandon();
	notLoc.toString();

	// should have only toString method
	const abandonedLoc = baseLocation.abandon();

	abandonedLoc.toString();

	// chaining examples
	jsExpression(() => '').contain('').not().timeout(10);
	jsExpression(() => '').contain('').timeout(10).not();
	jsExpression(() => '').not().timeout(10).equal('');
	jsExpression(() => '').timeout(10).not().endsWith('test');
	jsExpression(() => '').timeout(10).endWith('test').not();
	jsExpression(() => '').timeout(10).endWith('test').not().toAssert();

	// getters
	jsExpression(() => '').it.should.with.times;
	jsExpression(() => '').should.it.with.times;
	jsExpression(() => '').with.should.it.times;
	jsExpression(() => '').times.should.with.it;
}

function testOpenAppChain() {
	const {openApp} = suitest;

	// should have all necessary modifiers
	const openAppChain = openApp('some url');

	openAppChain.toString();
	openAppChain.then();
	openAppChain.abandon();
	openAppChain.clone();
	openAppChain.toAssert();

	// should have only toString method
	const abandonedOpenApp = openApp().abandon();

	abandonedOpenApp.toString();

	// getters
	openAppChain.it.should.with.times;
	openAppChain.should.it.with.times;
	openAppChain.with.should.it.times;
	openAppChain.times.should.with.it;
}

async function networkRequestTest() {
	const {networkRequest} = suitest;

	// should have all necessary modifiers
	const baseNetworkRequest = networkRequest();

	baseNetworkRequest.toString();
	baseNetworkRequest.then();
	baseNetworkRequest.abandon();
	baseNetworkRequest.clone();
	baseNetworkRequest.toAssert();
	baseNetworkRequest.equal('http://test');
	baseNetworkRequest.equals('http://test');
	baseNetworkRequest.wasMade();
	baseNetworkRequest.willBeMade();

	await suitest.networkRequest(); // wrong
	await suitest.networkRequest().willBeMade(); // still wrong
	await suitest.networkRequest().wasMade(); // still wrong
	await suitest.networkRequest().equal('http://test'); // still wrong
	await suitest.networkRequest().equals('http://test'); // still wrong
	await suitest.networkRequest().equal('http://test').willBeMade(); // correct
	await suitest.networkRequest().equal('http://test').wasMade(); // correct
	await suitest.networkRequest().wasMade().equal('http://test'); // correct
	// getters
	baseNetworkRequest.it.should.with.times;
	baseNetworkRequest.should.it.with.times;
	baseNetworkRequest.with.should.it.times;
	baseNetworkRequest.times.should.with.it;
}

function testOpenUrlChain() {
	const {openUrl} = suitest;

	// should have all necessary modifiers
	const openUrlChain = openUrl('some url');

	openUrlChain.toString();
	openUrlChain.then();
	openUrlChain.abandon();
	openUrlChain.clone();
	openUrlChain.toAssert();

	// should have only toString method
	const abandonedOpenUrl = openUrl('some url').abandon();

	abandonedOpenUrl.toString();

	// getters
	openUrlChain.it.should.with.times;
	openUrlChain.should.it.with.times;
	openUrlChain.with.should.it.times;
	openUrlChain.times.should.with.it;
}
function testPollUrlChain() {
	const {pollUrl} = suitest;

	// should have all necessary modifiers
	const openUrlChain = pollUrl('some url', '');

	openUrlChain.toString();
	openUrlChain.then();
	openUrlChain.abandon();
	openUrlChain.clone();
	openUrlChain.toAssert();

	// should have only toString method
	const abandonedOpenUrl = pollUrl('some url', '').abandon();

	abandonedOpenUrl.toString();

	// getters
	openUrlChain.it.should.with.times;
	openUrlChain.should.it.with.times;
	openUrlChain.with.should.it.times;
	openUrlChain.times.should.with.it;
}

async function testPosition() {
	const {position} = suitest;

	const samplePos = position(100, 100);

	samplePos.abandon();
	samplePos.clone();
	samplePos.toString();
	samplePos.toAssert();
	samplePos.then();

	// click position
	const clickPos = position(1, 1,).click();

	await clickPos;
	await clickPos.repeat(1);
	await clickPos.repeat(5).interval(300);

	// move to position
	await position(10, 10).moveTo();

	// getters
	samplePos.it.should.with.times;
	samplePos.should.it.with.times;
	samplePos.with.should.it.times;
	samplePos.times.should.with.it;
}

async function testPressButton() {
	await suitest.press(suitest.VRC.OK);

	// Press OK, UP once
	await suitest.press([suitest.VRC.OK, suitest.VRC.UP]);

	// Press OK exactly 10x every 10s
	await suitest.press(suitest.VRC.OK)
		.repeat(10)
		.interval(10000);

	// getters
	const pressOk = suitest.press(suitest.VRC.OK);

	pressOk.it.should.with.times;
	pressOk.should.it.with.times;
	pressOk.with.should.it.times;
	pressOk.times.should.with.it;
}

async function sleepTest() {
	const sampleSleep = suitest.sleep(10);

	await sampleSleep;

	sampleSleep.abandon();
	sampleSleep.then();
	sampleSleep.clone();
	sampleSleep.toString();

	sampleSleep.it.should.with.times;
	sampleSleep.should.it.with.times;
	sampleSleep.with.should.it.times;
	sampleSleep.times.should.with.it;
}

async function windowTest() {
	const {window} = suitest;

	window().abandon();
	window().clone();
	window().then();
	window().toAssert();
	window().toString();

	await window().goBack();
	await window().goForward();
	await window().dismissModal();
	await window().acceptModal();
	await window().acceptModal('some message here');
	await window().refresh();
	await window().setSize(1024, 768);

	// Send plain text to window
	await suitest.window().sendText('Some string');

	// Send text to window with Alt key pressed
	await suitest.window().sendText('[[Alt]]complex string[[Null]]');

	window().it.should.with.times;
	window().should.it.with.times;
	window().with.should.it.times;
	window().times.should.with.it;
}
