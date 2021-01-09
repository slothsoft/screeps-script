var constants = require('../src/role.handyman.js');

QUnit.module('role.handyman', function() {
	QUnit.test('exists', function(assert) {
		assert.equal(typeof constants === 'object' && constants !== null, true);
	});
});