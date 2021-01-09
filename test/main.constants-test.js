var classUnderTest = require('../src/main.constants.js');
var assert = require('assert');

describe('main.constants', function() {
	it('exists', function() {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
