var classUnderTest = require('../src/main.js');
var assert = require('assert');

describe('main', function() {
	it('exists', function() {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
