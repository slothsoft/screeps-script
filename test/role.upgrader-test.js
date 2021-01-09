var constants = require('../src/role.upgrader.js');

QUnit.module('role.upgrader', function() {
	QUnit.test('exists', function(assert) {
		assert.equal(typeof constants === 'object' && constants !== null, true);
	});
});