var constants = require('../src/main.game.js');

QUnit.module('main.game', function() {
	QUnit.test('exists', function(assert) {
		assert.equal(typeof constants === 'object' && constants !== null, true);
	});
});