var MainGame = require('../src/main.game');
var assert = require('assert');

// All methods will be mocked.

describe('main.game', () => {
	it('exists', () => {
		var startsWith = 'class MainGame';
		assert.equal(startsWith, MainGame.toString().substring(0, startsWith.length));
	});
});
