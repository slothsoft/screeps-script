var classUnderTest = require('../src/role.prototype.js');
var assert = require('assert');

describe('role.protoype', function() {
	it('exists', function() {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
