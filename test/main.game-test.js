var MainGame = require('../src/main.game');
var assert = require('assert');

// All methods will be mocked.

describe('main.game', () => {
	it('exists', () => {
		var startsWith = 'class MainGame';
		assert.equal(startsWith, MainGame.toString().substring(0, startsWith.length));
	});

	describe('main.game', () => {
		it('undefined', () => {
			assert.equal('undefined', MainGame.getDisplayName());
		});
		
		it('by name', () => {
			assert.equal('Name', MainGame.getDisplayName({ id : 'ID', name : 'Name' }));
		});

		it('by memory name', () => {
			assert.equal('Memory', MainGame.getDisplayName({ id : 'ID', memory: { name: 'Memory' }}));
		});

		it('by structure memory name', () => {
			Memory.structures.ID.name = 'Structure';
			assert.equal('Structure', MainGame.getDisplayName({ id : 'ID', structureType: true}));
		});
		
		it('by ID', () => {
			assert.equal('ID', MainGame.getDisplayName({ id : 'ID', memory: {} }));
		});

		it('by json', () => {
			assert.equal('{"test":"123"}', MainGame.getDisplayName({ test : '123' }));
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
			
			var result = MainGame.fetchMemoryOfStructure(structure);

			assert.deepEqual({}, result);
			assert.deepEqual({}, structure.memory);
			assert.deepEqual({}, Memory.structures.ABCDEFG1234567);
		});

		it('structures memory present, but not for this ID', () => {
			var structure = {
				id: 'ABCDEFG1234567',
			};
			
			Memory.structures = {};
			var result = MainGame.fetchMemoryOfStructure(structure);

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
			
			var result = MainGame.fetchMemoryOfStructure(structure);

			assert.deepEqual({ a: 'n' }, result);
			assert.deepEqual({ a: 'n' }, structure.memory);
			assert.deepEqual({ a: 'n' }, Memory.structures.ABCDEFG1234567);
		});
		
		it('use existing memory', () => {
			var structure = {
				id: 'ABCDEFG1234567',
				memory: { a: 'b' },
			};
			
			var result = MainGame.fetchMemoryOfStructure(structure);

			assert.deepEqual({ a: 'b' }, result);
		});
	});
});
