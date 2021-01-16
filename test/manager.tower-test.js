var TowerManager = require('../src/manager.tower');
var assert = require('assert');

//TODO: Test all methods.

describe('manager.base', () => {
	it('exists', () => {
		var startsWith = 'class TowerManager';
		assert.equal(startsWith, TowerManager.toString().substring(0, startsWith.length));
	});
});
