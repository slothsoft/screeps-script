var constants = require('../src/role.storekeeper.js');

QUnit.module('role.storekeeper', function() {
	QUnit.test('exists', function(assert) {
		assert.equal(typeof constants === 'object' && constants !== null, true);
	});
});