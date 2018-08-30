const fs = require('fs');
const path = require('path');
const SuitestError = require('./SuitestError.js');
const texts = require('../texts');

function mkDirByPathSync(targetDir, {isRelativeToScript = false} = {}) {
	const sep = path.sep;
	const initDir = path.isAbsolute(targetDir) ? sep : '';
	const baseDir = isRelativeToScript ? __dirname : '.';

	return targetDir.split(sep).reduce((parentDir, childDir) => {
		const curDir = path.resolve(baseDir, parentDir, childDir);

		try {
			fs.mkdirSync(curDir);
		} catch (err) {
			if (err.code === 'EEXIST') { // curDir already exists!
				return curDir;
			}

			// To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
			if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
				throw new SuitestError(
					texts['tl.failedToCreateDir'](err.code, parentDir),
					SuitestError.UNKNOWN_ERROR,
				);
			}

			const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;

			if (!caughtErr || caughtErr && targetDir === curDir) {
				throw new SuitestError(
					texts['tl.failedToCreateDir'](err.code, curDir),
					SuitestError.UNKNOWN_ERROR,
				);
			}
		}

		return curDir;
	}, initDir);
}

function createWriteStream(filePath) {

	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
	}

	return fs.createWriteStream(filePath, {flags: 'ax'}).on('error', (e) => {
		if (e.code === 'EACCES') {
			throw new SuitestError(
				texts['tl.createDirPermissionDenied'](filePath),
				SuitestError.UNKNOWN_ERROR,
			);
		} else {
			throw new SuitestError(
				texts['tl.failedToCreateDir'](e.code, filePath),
				SuitestError.UNKNOWN_ERROR,
			);
		}
	});
}

module.exports = {
	mkDirByPathSync,
	createWriteStream,
};
