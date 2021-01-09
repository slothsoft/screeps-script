var classUnderTest = require('../src/main.info.js');
var assert = require('assert');

describe('main.info', function() {
	it('exists', function() {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});