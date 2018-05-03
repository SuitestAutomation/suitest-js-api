const fs = require('fs');
const path = require('path');
const SuitestError = require('./SuitestError.js');
const texts = require('../texts');
const {EOL} = require('os');

function mkDirByPathSync(targetDir) {
	const sep = path.sep;
	const initDir = path.isAbsolute(targetDir) ? sep : '';
	const baseDir = '.';

	targetDir.split(sep).reduce((parentDir, childDir) => {
		const curDir = path.resolve(baseDir, parentDir, childDir);

		try {
			fs.mkdirSync(curDir);
		} catch (err) {
			if (err.code !== 'EEXIST' && err.code !== 'EACCES') {
				throw new SuitestError(
					texts['tl.failedToCreateDir'](),
					SuitestError.UNKNOWN_ERROR,
				);
			} else if (err.code === 'EACCES') {
				throw new SuitestError(
					texts['tl.createDirPermissionDenied'](curDir),
					SuitestError.UNKNOWN_ERROR,
				);
			}
		}

		return curDir;
	}, initDir);
}

function createWriteStream(pathToFile, deviceId) {
	const filePath = pathToFile + path.sep + `${deviceId}.log`;

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
				texts['tl.failedToCreateDir'](),
				SuitestError.UNKNOWN_ERROR,
			);
		}
	});
}

module.exports = {
	mkDirByPathSync,
	createWriteStream,
};
