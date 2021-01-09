var constants = require('../src/role.builder.js');

QUnit.module('role.builder', function() {
	QUnit.test('exists', function(assert) {
		assert.equal(typeof constants === 'object' && constants !== null, true);
	});
});