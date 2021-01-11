var classUnderTest = require('../src/main');
var assert = require('assert');

// TODO: Test these methods
// - fetchOldestCreep
// - spawnMiner
// - selfdestruct

describe('main', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});