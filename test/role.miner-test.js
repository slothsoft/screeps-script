var classUnderTest = require('../src/role.miner.js');
var assert = require('assert');

describe('role.miner', function() {
	it('exists', function() {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
