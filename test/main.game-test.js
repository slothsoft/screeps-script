var classUnderTest = require('../src/main.game.js');
var assert = require('assert');

describe('main.game', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
