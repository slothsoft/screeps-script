var classUnderTest = require('../src/role.harvester');
var assert = require('assert');

describe('role.harvester', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});
});
