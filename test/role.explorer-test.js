var classUnderTest = require('../src/role.explorer');
var assert = require('assert');

// Test all methods.

describe('role.explorer', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
