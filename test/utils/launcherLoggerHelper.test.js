const assert = require('assert');
const sinon = require('sinon');
const {mkDirByPathSync, createWriteStream} = require('../../lib/utils/launcherLoggerHelper');
const fs = require('fs');
const path = require('path');
const SuitestError = require('../../lib/utils/SuitestError');

describe('launcherLoggerHelper', () => {
	it('should call mkdirSync with proper arg', () => {
		const mkDir = sinon.stub(fs, 'mkdirSync');
		const sep = sinon.stub(path, 'sep').value('/');

		mkDirByPathSync('./path1/path2');

		assert.equal(mkDir.callCount, 3, 'mkDir called 3 times');
		assert.ok(mkDir.secondCall.args[0].endsWith('path1'), 'second call ends with path1');
		assert.ok(mkDir.thirdCall.args[0].endsWith('path2'), 'third call ends with path2');
		fs.mkdirSync.restore();
		sep.restore();
	});

	it('should call mkdirSync and throw conrrect errors', () => {
		const mkDir = sinon.stub(fs, 'mkdirSync').callsFake((p) => {
			const err = new Error('');

			if (p.includes('protectedPath1')) {
				err.code = 'EACCES';
				throw err;
			} else if (p.includes('protectedPath2')) {
				err.code = 'ANY';
				throw err;
			}
		});
		const sep = sinon.stub(path, 'sep').value('/');

		mkDirByPathSync('./path1/path2');

		assert.throws(mkDirByPathSync.bind(null, './protectedPath2'), (err) => {
			return err.type === SuitestError.type
				&& err.message.includes('ANY error')
				&& err.message.includes('protectedPath2');
		}, 'error handler handle error');
		assert.throws(mkDirByPathSync.bind(null, './protectedPath1'), (err) => {
			return err.type === SuitestError.type
				&& err.message.includes('Permission');
		}, 'error handler handle permission error');
		fs.mkdirSync.restore();
		sep.restore();
	});

	it('should call unlinkSync', () => {
		sinon.stub(fs, 'existsSync').callsFake((path) => {
			return path.startsWith('path1/path2');
		});
		const unlinkSync = sinon.stub(fs, 'unlinkSync');

		sinon.stub(fs, 'createWriteStream').callsFake(() => {
			return {on: () => null};
		});

		createWriteStream('path1/path2', '1');

		assert.equal(unlinkSync.callCount, 1, 'unlinkSync called 1 time');
		assert.ok(unlinkSync.firstCall.args[0].includes('path1/path2'), 'first call ends with path1/path2');
		fs.existsSync.restore();
		fs.unlinkSync.restore();
		fs.createWriteStream.restore();
	});

	it('should not call unlinkSync', () => {
		sinon.stub(fs, 'existsSync').callsFake(() => {
			return false;
		});
		const unlinkSync = sinon.stub(fs, 'unlinkSync');

		sinon.stub(fs, 'createWriteStream').callsFake(() => {
			return {on: () => null};
		});

		createWriteStream('path1/path2', '1');

		assert.ok(unlinkSync.called === false, 'unlinkSync called 0 time');
		fs.existsSync.restore();
		fs.unlinkSync.restore();
		fs.createWriteStream.restore();
	});

	it('should throw correct error if EACCES', () => {
		sinon.stub(fs, 'existsSync').callsFake(() => {
			return false;
		});
		const unlinkSync = sinon.stub(fs, 'unlinkSync');
		let errHandler = null;
		let streamEvent = null;

		sinon.stub(fs, 'createWriteStream').callsFake(() => {
			return {on: (event, handler) => {
				streamEvent = event;
				errHandler = handler;
			}};
		});

		createWriteStream('path1/path2', '1');

		assert.ok(unlinkSync.called === false, 'unlinkSync called 0 time');
		assert.equal(streamEvent, 'error', 'error handler attached');
		assert.equal(typeof errHandler, 'function', 'error handler is function');
		assert.throws(errHandler.bind(null, {code: 'EACCES'}), (err) => {
			return err.type === SuitestError.type
				&& err.message.includes('path1/path2')
				&& err.message.includes('Permission');
		}, 'error handler handle EACCES');
		assert.throws(errHandler.bind(null, {code: 'ANY'}), (err) => {
			return err.type === SuitestError.type
				&& err.message.includes('ANY error')
				&& err.message.includes('path1/path2');
		}, 'error handler handle error');
		fs.existsSync.restore();
		fs.unlinkSync.restore();
		fs.createWriteStream.restore();
	});
});
