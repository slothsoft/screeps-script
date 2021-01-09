var constants = require('../src/manager.base.js');

QUnit.module('manager.base', function() {
	QUnit.test('exists', function(assert) {
		assert.equal(typeof constants === 'object' && constants !== null, true);
	});
});