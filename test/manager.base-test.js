var classUnderTest = require('../src/manager.base');
var assert = require('assert');

//TODO: Test all methods.

describe('manager.base', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
