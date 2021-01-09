var classUnderTest = require('../src/main.constants.js');
var assert = require('assert');

describe('main.constants', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
