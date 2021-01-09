var classUnderTest = require('../src/role.harvester.js');
var assert = require('assert');

describe('role.harvester', function() {
	it('exists', function() {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
