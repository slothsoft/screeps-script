var constants = require('../src/role.harvester.js');

QUnit.module('role.harvester', function() {
	QUnit.test('exists', function(assert) {
		assert.equal(typeof constants === 'object' && constants !== null, true);
	});
});