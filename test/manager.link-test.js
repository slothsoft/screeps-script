var classUnderTest = require('../src/manager.link.js');
var assert = require('assert');

describe('manager.link', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
