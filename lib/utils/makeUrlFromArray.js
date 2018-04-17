/**
 * Compose url string and query params array into normalized reqest url string
 *
 * @param {string|[string, any]} url
 * @returns {string} normalized url
 */
function makeUrlFromArray(url) {
	let key, reg;
	let firstLoop = true;

	if (Object.prototype.toString.call(url) === '[object Array]') {
		// refill variables in url
		if (url[1]) {
			for (key in url[1]) {
				reg = new RegExp(':' + key, 'g');
				url[0] = url[0].replace(reg, encodeURIComponent(url[1][key]));
			}
		}

		// refill get params
		if (url[2]) {
			for (key in url[2]) {
				url[0] += firstLoop
					? '?' + key + '=' + encodeURIComponent(url[2][key])
					: '&' + key + '=' + encodeURIComponent(url[2][key]);

				firstLoop = false;
			}
		}

		return url[0];
	}

	return url;
}

module.exports = makeUrlFromArray;
