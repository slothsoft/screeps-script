var classUnderTest = require('../src/role.handyman');
var assert = require('assert');

describe('role.handyman', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
