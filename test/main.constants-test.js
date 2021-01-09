var constants = require('../src/main.constants.js');

QUnit.module("main.constants", function() {
	QUnit.test("exists", function(assert) {
		assert.equal(typeof constants === 'object' && constants !== null, true);
	});
});