var LinkManager = require('../src/manager.link');
var assert = require('assert');

// TODO: Test all methods.

describe('manager.link', () => {
	it('exists', () => {
		var startsWith = 'class LinkManager';
		assert.equal(startsWith, LinkManager.toString().substring(0, startsWith.length));
	});
});
