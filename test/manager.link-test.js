var constants = require('../src/manager.link.js');

QUnit.module('manager.link', function() {
	QUnit.test('exists', function(assert) {
		assert.equal(typeof constants === 'object' && constants !== null, true);
	});
});