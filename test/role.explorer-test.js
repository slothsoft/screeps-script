var classUnderTest = require('../src/role.explorer.js');
var assert = require('assert');

describe('role.explorer', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
