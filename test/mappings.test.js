const assert = require('assert');

const vrcConstants = require('../lib/constants/vrc');
const elementConstants = require('../lib/constants/element');

const mappings = require('../lib/mappings');

describe('mappipngs', () => {
	it('should cover all vrcConstants constants', () => {
		Object.values(vrcConstants).forEach(symb => {
			assert.equal(symb in mappings.VRC, true, symb);
		});
	});

	it('should cover all elementConstants constants', () => {
		Object.keys(elementConstants).forEach(key => {
			Object.values(elementConstants[key]).forEach(symb => {
				assert.equal(symb in mappings[key], true, symb);
			});
		});
	});
});
