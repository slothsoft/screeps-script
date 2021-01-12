var classUnderTest = require('../src/main.constants');
var assert = require('assert');

// No methods present.

describe('main.constants', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
