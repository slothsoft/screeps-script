var MainGame = require('../src/main.game');
var assert = require('assert');

// All methods will be mocked.

describe('main.game', () => {
	it('exists', () => {
		var startsWith = 'class MainGame';
		assert.equal(startsWith, MainGame.toString().substring(0, startsWith.length));
	});

	describe('main.game', () => {
		it('by name', () => {
			assert.equal('Name', MainGame.getDisplayName({ id : 'ID', name : 'Name' }));
		});

		it('by memory name', () => {
			assert.equal('Memory', MainGame.getDisplayName({ id : 'ID', memory: { name: 'Memory' }}));
		});
		
		it('by ID', () => {
			assert.equal('ID', MainGame.getDisplayName({ id : 'ID', memory: {} }));
		});

		it('by json', () => {
			assert.equal('{"test":"123"}', MainGame.getDisplayName({ test : '123' }));
		});
	});
});
