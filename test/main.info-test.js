var constants = require('../src/main.info.js');

QUnit.module('main.info', function() {
	QUnit.test('exists', function(assert) {
		assert.equal(typeof constants === 'object' && constants !== null, true);
	});
});