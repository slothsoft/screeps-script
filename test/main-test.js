 oldRequire = require;
 require = oldRequire;
var constants = require('../src/main.js');

QUnit.module('main', function() {
	QUnit.test('exists', function(assert) {
		assert.equal(typeof constants === 'object' && constants !== null, true);
	});
});