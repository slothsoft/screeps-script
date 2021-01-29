var MainUtil = require('../src/main.util');
var assert = require('assert');

// All methods will be mocked.

describe('main.util', () => {
	it('exists', () => {
		var startsWith = 'class MainUtil';
		assert.equal(startsWith, MainUtil.toString().substring(0, startsWith.length));
	});

	describe('main.util', () => {
		it('undefined', () => {
			assert.equal('undefined', MainUtil.getDisplayName());
		});
		
		it('by name', () => {
			assert.equal('Name', MainUtil.getDisplayName({ id : 'ID', name : 'Name' }));
		});

		it('by memory name', () => {
			assert.equal('Memory', MainUtil.getDisplayName({ id : 'ID', memory: { name: 'Memory' }}));
		});

		it('by structure memory name', () => {
			Memory.structures.ID.name = 'Structure';
			assert.equal('Structure', MainUtil.getDisplayName({ id : 'ID', structureType: true}));
		});
		
		it('by ID', () => {
			assert.equal('ID', MainUtil.getDisplayName({ id : 'ID', memory: {} }));
		});

		it('by json', () => {
			assert.equal('{"test":"123"}', MainUtil.getDisplayName({ test : '123' }));
		});
	});

	describe('#fetchMemoryOfStructure', () => {
		beforeEach(() => {
		    delete Memory.structures;
		});
		
		it('create everything entirely', () => {
			var structure = {
				id: 'ABCDEFG1234567',
			};
			
			var result = MainUtil.fetchMemoryOfStructure(structure);

			assert.deepEqual({}, result);
			assert.deepEqual({}, structure.memory);
			assert.deepEqual({}, Memory.structures.ABCDEFG1234567);
		});

		it('structures memory present, but not for this ID', () => {
			var structure = {
				id: 'ABCDEFG1234567',
			};
			
			Memory.structures = {};
			var result = MainUtil.fetchMemoryOfStructure(structure);

			assert.deepEqual({}, result);
			assert.deepEqual({}, structure.memory);
			assert.deepEqual({}, Memory.structures.ABCDEFG1234567);
		});

		it('link existing memory', () => {
			var structure = {
				id: 'ABCDEFG1234567'
			};
			
			Memory.structures = {};
			Memory.structures.ABCDEFG1234567 = { a: 'n' };
			
			var result = MainUtil.fetchMemoryOfStructure(structure);

			assert.deepEqual({ a: 'n' }, result);
			assert.deepEqual({ a: 'n' }, structure.memory);
			assert.deepEqual({ a: 'n' }, Memory.structures.ABCDEFG1234567);
		});
		
		it('use existing memory', () => {
			var structure = {
				id: 'ABCDEFG1234567',
				memory: { a: 'b' },
			};
			
			var result = MainUtil.fetchMemoryOfStructure(structure);

			assert.deepEqual({ a: 'b' }, result);
		});
	});
});
