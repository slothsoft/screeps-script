var classUnderTest = require('../src/manager.base.js');
var assert = require('assert');

describe('manager.base', function() {
	it('exists', function() {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
