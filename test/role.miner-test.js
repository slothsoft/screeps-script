var classUnderTest = require('../src/role.miner');
var assert = require('assert');

describe('role.miner', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
