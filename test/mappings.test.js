const assert = require('assert');

const vrcConstants = require('../lib/constants/vrc');
const elementConstants = require('../lib/constants/element');

const mappings = require('../lib/mappings');

describe('mappipngs', () => {
	it('should cover all vrcConstants constants', () => {
		Object.values(vrcConstants).forEach(button => {
			assert.equal(Object.values(mappings.VRC).includes(button), true, button);
		});
	});

	it('should cover all elementConstants constants', () => {
		Object.keys(elementConstants).forEach(key => {
			Object.values(elementConstants[key]).forEach(elConst => {
				assert.equal(Object.values(mappings[key]).includes(elConst), true, elConst);
			});
		});
	});
});
