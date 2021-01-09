var constants = require('../src/role.miner.js');

QUnit.module('role.miner', function() {
	QUnit.test('exists', function(assert) {
		assert.equal(typeof constants === 'object' && constants !== null, true);
	});
});