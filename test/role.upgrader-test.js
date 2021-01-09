var classUnderTest = require('../src/role.upgrader.js');
var assert = require('assert');

describe('role.upgrader', function() {
	it('exists', function() {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
