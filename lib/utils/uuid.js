const crypto = require("crypto");

function uuid() {
	return crypto.randomUUID();
}

module.exports = uuid;
