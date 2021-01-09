var classUnderTest = require('../src/role.upgrader.js');
var assert = require('assert');

describe('role.upgrader', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
