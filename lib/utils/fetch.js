const nodeFetch = require('node-fetch');
const {name, version} = require('../../package.json');

async function fetch(resource, options = {}) {
	if (!options.headers) {
		options.headers = {};
	}
	setUserAgent(options.headers);

	return await nodeFetch(resource, options);
}

/**
 * Always overwrite user agent to ours
 * @param {Object} headers
 */
function setUserAgent(headers) {
	const uaHeader = 'user-agent';
	const headerName = Object.keys(headers).find(headerName => headerName.toLowerCase() === uaHeader);

	headers[headerName || uaHeader] = `${name}/${version}`;
}

module.exports = {
	fetch,
	setUserAgent,
};
