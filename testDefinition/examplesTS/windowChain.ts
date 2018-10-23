import * as suitest from '../../index'

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
