var classUnderTest = require('../src/role.prototype.js');
var assert = require('assert');

describe('role.protoype', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
