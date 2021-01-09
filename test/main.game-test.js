var classUnderTest = require('../src/main.game.js');
var assert = require('assert');

describe('main.game', function() {
	it('exists', function() {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
