var classUnderTest = require('../src/manager.link.js');
var assert = require('assert');

describe('manager.link', function() {
	it('exists', function() {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
