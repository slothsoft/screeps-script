var TowerManager = require('../src/manager.tower');
var assert = require('assert');

var Room = require('./mock/room-mock');
var RoomPosition = require('./mock/room-position-mock');
var Store = require('./mock/store-mock');

// All methods tested.

describe('manager.base', () => {
	it('exists', () => {
		var startsWith = 'class TowerManager';
		assert.equal(startsWith, TowerManager.toString().substring(0, startsWith.length));
	});

	describe('#findTowers', () => {
		it('accept correct structures', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				
				var filter = opt.filter;
				
				var structure = {};
				
				structure.structureType = STRUCTURE_TOWER; 
				assert.equal(true, filter(structure));
			};
	
			var manager = new TowerManager(room);
			manager._findTowers();
			
			assert.equal(true, findWasCalled);
		});

		it('reject incorrect structures', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				
				var filter = opt.filter;

				var structure = {};
				
				structure.structureType = STRUCTURE_LINK; 
				assert.equal(false, filter(structure));
			};
	
			var manager = new TowerManager(room);
			manager._findTowers();
			
			assert.equal(true, findWasCalled);
		});
	});

	describe('#runTower', () => {
		it('do nothing', () => {
			var tower = {};
			tower.pos = new RoomPosition();
			tower.attack = target => assert.fail('attack() should not have been called');
			tower.repair = target => assert.fail('repair() should not have been called');
			tower.pos.findClosestByRange = type => null;

			var room = new Room();
			
			var manager = new TowerManager(room);
			manager._runTower(tower);
		});

		it('attack', () => {
			var tower = {};
			tower.pos = new RoomPosition();
			tower.repair = target => assert.fail('repair() should not have been called');
			tower.pos.findClosestByRange = type => type == FIND_HOSTILE_CREEPS ? 'creep' : null;

			var called = false;
			tower.attack = target => {
				called = true;

				assert.equal('creep', target);
			};
			
			var room = new Room();
			
			var manager = new TowerManager(room);
			manager._runTower(tower);
			
			assert.equal(true, called);
		});

		it('repair', () => {
			var tower = {};
			tower.pos = new RoomPosition();
			tower.attack = target => assert.fail('attack() should not have been called');
			tower.pos.findClosestByRange = type => type == FIND_MY_CREEPS ? 'creep' : null;

			var called = false;
			tower.repair = target => {
				called = true;

				assert.equal('creep', target);
			};
			
			var room = new Room();
			
			var manager = new TowerManager(room);
			manager._runTower(tower);
			
			assert.equal(true, called);
		});
	});
});
