var constants = require('../src/role.explorer.js');

QUnit.module('role.explorer', function() {
	QUnit.test('exists', function(assert) {
		assert.equal(typeof constants === 'object' && constants !== null, true);
	});
});