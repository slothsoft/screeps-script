var classUnderTest = require('../src/role.miner.js');
var assert = require('assert');

describe('role.miner', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
