var classUnderTest = require('../src/role.storekeeper.js');
var assert = require('assert');

describe('role.storekeeper', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
