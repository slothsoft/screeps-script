var classUnderTest = require('../src/main.js');
var assert = require('assert');

describe('main', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
	
	// TODO: Test these methods
	// - fetchOldestCreep
	// - spawnMiner
	// - selfdestruct
});
