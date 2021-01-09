var classUnderTest = require('../src/manager.base.js');
var assert = require('assert');

describe('manager.base', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
