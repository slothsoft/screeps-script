var classUnderTest = require('../src/role.explorer.js');
var assert = require('assert');

describe('role.explorer', function() {
	it('exists', function() {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
