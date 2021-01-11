var classUnderTest = require('../src/main.game');
var assert = require('assert');

// All methods will be mocked.

describe('main.game', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
