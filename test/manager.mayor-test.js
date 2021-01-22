var MayorManager = require('../src/manager.mayor');
var assert = require('assert');

var game = require('../src/main.game');
var info = require('../src/main.info');

var Room = require('./mock/room-mock');

// TODO: Test these methods:
// - runAll()
// - constructor()
// - run()
// - validate()
// - validateRoads()
// - buildRoads()
// - fixProblems()
// - visualize()
// - getModeDisplayName()

describe('manager.mayor', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	});
	
	it('exists', () => {
		var startsWith = 'class MayorManager';
		assert.equal(startsWith, MayorManager.toString().substring(0, startsWith.length));
	});

	describe('#fetchMemoryOfMayor', () => {
		it('no memory', () => {
			var room = new Room();
	
			var result = new MayorManager(room)._fetchMemoryOfMayor();
			
			var expecting = {
				x: 10,
				y: 0,
				mode: MayorManager.MODE_DEFAULT,
				temp: {},
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.mayor);
		});

		it('some memory', () => {
			var room = new Room();
			room.memory.mayor = {
				y: 10,
				mode: 'warn',
			};
	
			var result = new MayorManager(room)._fetchMemoryOfMayor();
			
			var expecting = {
				x: 10,
				y: 10,
				mode: 'warn',
				temp: {},
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.mayor);
		});

		it('memory present', () => {
			var room = new Room();
			room.memory.mayor = {
				x: 1,
				y: 2,
				mode: '3',
			};
	
			var result = new MayorManager(room)._fetchMemoryOfMayor();
			
			var expecting = {
				x: 1,
				y: 2,
				mode: '3',
				temp: {},
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.mayor);
		});
	});
});
