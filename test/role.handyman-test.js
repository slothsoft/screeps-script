var Handyman = require('../src/role.handyman');
var assert = require('assert');

var constants = require('../src/main.constants');
var info = require('../src/main.info');

var Creep = require('./mock/creep-mock');
var Room = require('./mock/room-mock');
var Spawn = require('./mock/spawn-mock');
var Store = require('./mock/store-mock');

// All methods tested.

describe('role.handyman', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	});
	
	it('constructor', () => {
		var startsWith = 'class Handyman';
		assert.equal(startsWith, Handyman.toString().substring(0, startsWith.length));
		
		var object = new Handyman();
		assert.equal('Handyman', object.roleName);
		assert.equal('#0000ff', object.color);
		assert.equal('🔧', object.symbol);
		assert.equal(0, object.priority);
	});

	describe('#findTargets', () => {
		it('find correct structures', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				assert.equal(FIND_STRUCTURES, type);
				return [];
			};

			var object = new Handyman();
			object._findTargets(room);
			
			assert.equal(true, findWasCalled);
		});
	});
	
	describe('#work (via run)', () => {
		it('lifecycle', () => {
			
			var creep = new Creep('work', [CARRY]);
			creep.store.usedCapacity = 5;
			creep.store[RESOURCE_ENERGY] = creep.store;
			
			var source = new Spawn();
			source.pos.x = 13;
			source.pos.y = 42;
	
			var target = new Spawn();
			target.hits = 900;
			target.hitsMax = 1000;
			target.pos.x = 23;
			target.pos.y = 6;
			
			var object = new Handyman();
			object._findSources = room => [ source ];
			object._findTargets = room => [ target ];
			
			// store is half full, so first travel to source
			object.run(creep);
	
			assert.equal(5, creep.store[RESOURCE_ENERGY].getUsedCapacity());
			assert.equal(50, creep.store[RESOURCE_ENERGY].getCapacity());
			assert.equal(source.pos.x, creep.pos.x);
			assert.equal(source.pos.y, creep.pos.y);
	
			// store is still half full, so harvest source
			object.run(creep);
	
			assert.equal(50, creep.store[RESOURCE_ENERGY].getUsedCapacity());
			assert.equal(50, creep.store[RESOURCE_ENERGY].getCapacity());
			assert.equal(source.pos.x, creep.pos.x);
			assert.equal(source.pos.y, creep.pos.y);
	
			// store is full, target is out of range, so move to target
			object.run(creep);
	
			assert.equal(50, creep.store[RESOURCE_ENERGY].getUsedCapacity());
			assert.equal(50, creep.store[RESOURCE_ENERGY].getCapacity());
			assert.equal(target.pos.x, creep.pos.x);
			assert.equal(target.pos.y, creep.pos.y);
	
			// store is full, target is in range, so work
			object.run(creep);
	
			assert.equal(950, target.hits);
			assert.equal(0, creep.store.getUsedCapacity());
			assert.equal(50, creep.store.getCapacity());
			assert.equal(target.pos.x, creep.pos.x);
			assert.equal(target.pos.y, creep.pos.y);
	
			// 2) store is empty, so first travel to source
			object.run(creep);

			assert.equal(0, creep.store.getUsedCapacity());
			assert.equal(50, creep.store.getCapacity());
			assert.equal(source.pos.x, creep.pos.x);
			assert.equal(source.pos.y, creep.pos.y);

			// 2) store is still half full, so harvest source
			object.run(creep);
	
			assert.equal(50, creep.store[RESOURCE_ENERGY].getUsedCapacity());
			assert.equal(50, creep.store[RESOURCE_ENERGY].getCapacity());
			assert.equal(source.pos.x, creep.pos.x);
			assert.equal(source.pos.y, creep.pos.y);
	
			// 2) store is full, target is out of range, so move to target
			object.run(creep);
	
			assert.equal(50, creep.store[RESOURCE_ENERGY].getUsedCapacity());
			assert.equal(50, creep.store[RESOURCE_ENERGY].getCapacity());
			assert.equal(target.pos.x, creep.pos.x);
			assert.equal(target.pos.y, creep.pos.y);
	
			// 2) store is full, target is in range, so work
			object.run(creep);
	
			assert.equal(1000, target.hits);
			assert.equal(0, creep.store.getUsedCapacity());
			assert.equal(50, creep.store.getCapacity());
			assert.equal(target.pos.x, creep.pos.x);
			assert.equal(target.pos.y, creep.pos.y);
		});
		
		it('self-destruct', () => {
			info.clearLines();
			
			var creep = new Creep('run');
			creep.memory.selfdestruct = true;

			var spawn = new Spawn();
			spawn.pos.x = 13;
			spawn.pos.y = 42;
			creep.pos.findClosestByPath = type => spawn;
			
			var object = new Handyman();
			
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

		it('pickup energy', () => {
			info.clearLines();

			var droppedEnergy = new Spawn();
			droppedEnergy.resourceType = RESOURCE_ENERGY;
			droppedEnergy.pos.x = 12;
			droppedEnergy.pos.y = 13;
			
			var creep = new Creep('run');
			creep.store = new Store(100);
			creep.pos.findInRange = (type) => (type == FIND_DROPPED_RESOURCES) ? [ droppedEnergy ] : [];
			
			var object = new Handyman();
			
			// dropped energy is far away, so go there
			creep.pickup = resource => (resource == droppedEnergy) ? ERR_NOT_IN_RANGE : -1;
			object._work = (workingCreep) => assert.fail('Creep cannot work while moving!');
			
			object.run(creep);

			assert.equal(12, creep.pos.x);
			assert.equal(13, creep.pos.y);
			
			// dropped energy is close, so pickup
			creep.pickup = resource => (resource == droppedEnergy) ? OK : -1;
			
			var workCalled = false; 
			object._work = (workingCreep) => workCalled = true;
			
			object.run(creep);

			assert.equal(12, creep.pos.x);
			assert.equal(13, creep.pos.y);
			assert.equal(true, workCalled);

		});
	});

	describe('#sortTargetForClosest', () => {
		it('sort by hits', () => {
			
			var creep = new Creep('sortTargetForClosest', [CARRY, CARRY]);
			
			var target1 = new Spawn();
			target1.hitsMax = 1000; 
			target1.hits = 500;
			
			var target2 = new Spawn();
			target2.hitsMax = 1000; 
			target2.hits = 700;

			var object = new Handyman();
			
			assert.deepEqual([target2, target1], object._sortTargetForClosest([target1, target2], creep));
		});

		it('sort by hits but stay with target', () => {
			
			var creep = new Creep('sortTargetForClosest', [CARRY, CARRY]);
			
			var target1 = new Spawn();
			target1.hitsMax = 1000; 
			target1.hits = 500;
			
			var target2 = new Spawn();
			target2.hitsMax = 1000; 
			target2.hits = 700;

			var object = new Handyman();
			
			assert.deepEqual([target2, target1], object._sortTargetForClosest([target1, target2], creep));
			
			// 2nd time take the same target

			target1.hits = 900;
			assert.deepEqual([target2], object._sortTargetForClosest([target1, target2], creep));
		});

		it('sort by hits but don not stay with target after fix', () => {
			var creep = new Creep('sortTargetForClosest', [CARRY, CARRY]);
			
			var target1 = new Spawn();
			target1.hitsMax = 1000; 
			target1.hits = 500;
			
			var target2 = new Spawn();
			target2.hitsMax = 1000; 
			target2.hits = 700;

			var object = new Handyman();
			
			assert.deepEqual([target2, target1], object._sortTargetForClosest([target1, target2], creep));
			
			// 2nd time the target was fixed, so take the other target

			target2.hits = 1000;
			assert.deepEqual([target1], object._sortTargetForClosest([target1], creep));
		});
	});
});
