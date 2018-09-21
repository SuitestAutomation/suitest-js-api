import * as suitest from '../../index';

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
