var classUnderTest = require('../src/role.handyman.js');
var assert = require('assert');

describe('role.handyman', function() {
	it('exists', function() {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
