var classUnderTest = require('../src/role.upgrader');
var assert = require('assert');

describe('role.upgrader', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
