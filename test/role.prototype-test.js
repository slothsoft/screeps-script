var constants = require('../src/role.prototype.js');

QUnit.module('role.prototype', function() {
	QUnit.test('exists', function(assert) {
		assert.equal(typeof constants === 'object' && constants !== null, true);
	});
});