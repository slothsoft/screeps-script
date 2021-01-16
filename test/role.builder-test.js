var Builder = require('../src/role.builder');
var assert = require('assert');

var constants = require('../src/main.constants');
var info = require('../src/main.info');

var Creep = require('./mock/creep-mock');
var Room = require('./mock/room-mock.js');
var Spawn = require('./mock/spawn-mock');
var Store = require('./mock/store-mock.js');

// All methods tested.

describe('role.builder', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	    global.Game = require('./mock/game-mock').Game;
	});
	
	it('constructor', () => {
		var startsWith = 'class Builder';
		assert.equal(startsWith, Builder.toString().substring(0, startsWith.length));
		
		var object = new Builder();
		assert.equal('Builder', object.roleName);
		assert.equal('#ffff00', object.color);
		assert.equal('🔨', object.symbol);
		assert.equal(70, object.priority);

		assert.equal(constants.SOURCE_USE_SOURCE, object.useStorageAsSource);
		assert.equal(constants.SOURCE_USE_STORAGE, object.useSourceAsSource);
	});

	describe('#findTargets', () => {
		it('find correct structures', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				assert.equal(FIND_MY_CONSTRUCTION_SITES, type);
			};

			var object = new Builder();
			object.findTargets(room);
			
			assert.equal(true, findWasCalled);
		});
	});
	
	describe('#work (via run)', () => {
		it('lifecycle', () => {
			
			var creep = new Creep('work', [CARRY, CARRY]);
			creep.store.usedCapacity = 50;
			creep.store[RESOURCE_ENERGY] = creep.store;
			
			var source = new Spawn();
			source.pos.x = 13;
			source.pos.y = 42;
	
			var target = new Spawn();
			target.pos.x = 23;
			target.pos.y = 6;
			
			var object = new Builder();
			object.findSources = room => [ source ];
			object.findTargets = room => [ target ];
			
			// store is half full, so first travel to source
			object.run(creep);
	
			assert.equal(50, creep.store[RESOURCE_ENERGY].getUsedCapacity());
			assert.equal(100, creep.store[RESOURCE_ENERGY].getCapacity());
			assert.equal(source.pos.x, creep.pos.x);
			assert.equal(source.pos.y, creep.pos.y);
	
			// store is still half full, so harvest source
			object.run(creep);
	
			assert.equal(100, creep.store[RESOURCE_ENERGY].getUsedCapacity());
			assert.equal(100, creep.store[RESOURCE_ENERGY].getCapacity());
			assert.equal(source.pos.x, creep.pos.x);
			assert.equal(source.pos.y, creep.pos.y);
	
			// store is full, target is out of range, so move to target
			object.run(creep);
	
			assert.equal(100, creep.store[RESOURCE_ENERGY].getUsedCapacity());
			assert.equal(100, creep.store[RESOURCE_ENERGY].getCapacity());
			assert.equal(target.pos.x, creep.pos.x);
			assert.equal(target.pos.y, creep.pos.y);
	
			// store is full, target is in range, so work
			object.run(creep);
	
			assert.equal(true, target.memory.wasBuilt);
			assert.equal(0, creep.store.getUsedCapacity());
			assert.equal(100, creep.store.getCapacity());
			assert.equal(target.pos.x, creep.pos.x);
			assert.equal(target.pos.y, creep.pos.y);
	
			// 2) store is empty, so first travel to source
			object.run(creep);

			assert.equal(true, target.memory.wasBuilt);
			assert.equal(0, creep.store.getUsedCapacity());
			assert.equal(100, creep.store.getCapacity());
			assert.equal(source.pos.x, creep.pos.x);
			assert.equal(source.pos.y, creep.pos.y);
		});
		
		it('self-destruct', () => {
			info.clearLog();
			
			var creep = new Creep('run');
			creep.memory.selfdestruct = true;

			var spawn = new Spawn();
			spawn.pos.x = 13;
			spawn.pos.y = 42;
			creep.pos.findClosestByPath = type => spawn;
			
			var object = new Builder();
			
			// spawn is far away, so go there
			object.run(creep);

			assert.equal(spawn.pos.x, creep.pos.x);
			assert.equal(spawn.pos.y, creep.pos.y);
			assert.equal(creep, Game.creeps['run']);

			// spawn is now close, so self-destruct
			object.run(creep);

			assert.equal(spawn.pos.x, creep.pos.x);
			assert.equal(spawn.pos.y, creep.pos.y);
			assert.equal(null, Game.creeps['run']);
		});
	});

	describe('#sortTargetForClosest', () => {
		it('sort by range', () => {
			
			var creep = new Creep('sortTargetForClosest', [CARRY, CARRY]);
			
			var target1 = new Spawn();
			target1.progressTotal = 1000; 
			target1.progress = 500;
			
			var target2 = new Spawn();
			target2.progressTotal = 1000; 
			target2.progress = 500;

			creep.pos.getRangeTo = t => t == target1 ? 3 : 7;

			var object = new Builder();
			
			assert.deepEqual([target1, target2], object.sortTargetForClosest([target1, target2], creep));
		});

		it('sort by progress', () => {
			
			var creep = new Creep('sortTargetForClosest', [CARRY, CARRY]);
			creep.pos.getRangeTo = t => 5;
			
			var target1 = new Spawn();
			
			var target2 = new Spawn();

			var object = new Builder();
			
			// sort with same total
			
			target1.progressTotal = 1000; 
			target1.progress = 500;
			
			target2.progressTotal = 1000; 
			target2.progress = 700;
			
			assert.deepEqual([target2, target1], object.sortTargetForClosest([target1, target2], creep));
			
			// sort with different total
			
			target1.progressTotal = 700; 
			target1.progress = 500;
			
			target2.progressTotal = 1000; 
			target2.progress = 700;

			assert.deepEqual([target1, target2], object.sortTargetForClosest([target1, target2], creep));
		});


		it('sort by both', () => {
			
			var creep = new Creep('sortTargetForClosest', [CARRY, CARRY]);
			creep.pos.getRangeTo = t => 5;
			
			var target1 = new Spawn();
			target1.progressTotal = 1000; 
			
			var target2 = new Spawn();
			target2.progressTotal = 1000; 

			var object = new Builder();

			// both targets are on top of each other, sort by progress
			target1.progress = 700;
			target2.progress = 500;
			creep.pos.getRangeTo = t => t == target1 ? 3 : 3;
			
			assert.deepEqual([target1, target2], object.sortTargetForClosest([target1, target2], creep));
			
			// both targets are close together, sort by progress
			target1.progress = 500;
			target2.progress = 700;
			creep.pos.getRangeTo = t => t == target1 ? 3 : 4;
			
			assert.deepEqual([target2, target1], object.sortTargetForClosest([target1, target2], creep));

			// both targets are far apart, sort by range
			target1.progress = 500;
			target2.progress = 700;
			creep.pos.getRangeTo = t => t == target1 ? 4 : 14;
			
			assert.deepEqual([target1, target2], object.sortTargetForClosest([target1, target2], creep));
		});
	});
});
