var classUnderTest = require('../src/manager.link');
var assert = require('assert');

describe('manager.link', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
