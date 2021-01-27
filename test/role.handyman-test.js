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

	beforeEach(() => {
		Game.clearAll();
		info.clearLines();
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
			
			assert.deepEqual([target1, target2], object._sortTargetForClosest([target1, target2], creep));
		});
	});

	describe('#findClosestTarget', () => {
		it('sort by hits but stay with target', () => {
			
			var creep = new Creep('sortTargetForClosest', [CARRY, CARRY]);
			
			var target1 = new Spawn();
			target1.hitsMax = 1000; 
			target1.hits = 500;
			
			var target2 = new Spawn();
			target2.hitsMax = 1000; 
			target2.hits = 700;

			var targets = [];
			targets[target1.id] = target1;
			targets[target2.id] = target2;
			Game.getObjectById = id => targets[id];
			
			var object = new Handyman();
			object._findTargets = room => [ target1, target2 ];
			
			assert.deepEqual(target1, object._findClosestTarget(creep));
			
			// 2nd time take the same target

			target1.hits = 900;
			assert.deepEqual(target1, object._findClosestTarget(creep));
		});

		it('sort by hits but do not stay with target after fix', () => {
			var creep = new Creep('sortTargetForClosest', [CARRY, CARRY]);
			
			var target1 = new Spawn();
			target1.hitsMax = 1000; 
			target1.hits = 500;
			
			var target2 = new Spawn();
			target2.hitsMax = 1000; 
			target2.hits = 700;
			
			var targets = [];
			targets[target1.id] = target1;
			targets[target2.id] = target2;
			Game.getObjectById = id => targets[id];

			var object = new Handyman();
			object._findTargets = room => [ target1, target2 ];
			
			assert.deepEqual(target1, object._findClosestTarget(creep));

			// 2nd time the target was fixed, so take the other target

			target1.hits = 1000;
			object._findTargets = room => [ target2 ];
			assert.deepEqual(target2, object._findClosestTarget(creep));
		});
	});

	describe('TARGET_MODE_USE_IF_VALID', () => {
		var setupHandyman = function() {
			
			// this is the default set up (see #findClosestTarget)
	
			var targetA = new Spawn(null, 'A');
			targetA.hitsMax = 1000; 
			targetA.hits = 400;
			targetA.pos.x = 4;
	
			var targetB = new Spawn(null, 'B');
			targetB.hitsMax = 1000; 
			targetB.hits = 100;
			targetB.pos.x = 1;
	
			var targetC = new Spawn(null, 'C');
			targetC.hitsMax = 1000; 
			targetC.hits = 1000;
			targetC.pos.x = 10;
	
			var targetD = new Spawn(null, 'D');
			targetD.hitsMax = 1000; 
			targetD.hits = 1100;
			targetD.pos.x = 11;
			
			var targets = [];
			targets[targetA.id] = targetA;
			targets[targetB.id] = targetB;
			targets[targetC.id] = targetC;
			targets[targetD.id] = targetD;
			Game.getObjectById = id => targets[id];
			
			var object = new Handyman();
			object._findTargets = room => [ targetA, targetB, targetC ];

			assert.equal(targetB, object._findClosestTarget(new Creep('TARGET_MODE_X')));
			return object;
		}
		
		describe('#findClosestTarget', () => {
			it('target found', () => {
				var creep = new Creep('Handyman');
				creep.memory.target = 'C';

				var object = setupHandyman();
				
				assert.equal('C', object._findClosestTarget(creep).id);
				assert.equal(0, info.getLines().length, info.getLines().toString());
			});

			it('target not valid', () => {
				// if it was not found in "findTargets()", the target is not valid -> use other
				var creep = new Creep('Handyman');
				creep.memory.target = 'D';

				var object = setupHandyman();
				
				assert.equal('B', object._findClosestTarget(creep).id);
				assert.equal(0, info.getLines().length, info.getLines().toString());
			});
			
			it('target not found', () => {
				// target is not even a game object -> error and use other
				var creep = new Creep('Handyman');
				creep.memory.target = 'E';

				var object = setupHandyman();
				
				assert.equal('B', object._findClosestTarget(creep).id);
				assert.equal(1, info.getLines().length);
				assert.equal('🛑 Handyman could not find target: E', info.getLine(0));
			});
		});
	});

	describe('SOURCE_MODE_USE_OR_WAIT', () => {
		var setupHandyman = function() {
			
			// this is the default set up (see #findClosestSource)
	
			var sourceA = new Spawn(null, 'A');
			sourceA.pos.x = 4;
	
			var sourceB = new Spawn(null, 'B');
			sourceB.pos.x = 1;
	
			var sourceC = new Spawn(null, 'C');
			sourceC.pos.x = 10;
	
			var sourceD = new Spawn(null, 'D');
			sourceD.pos.x = 11;
			
			var sources = [];
			sources[sourceA.id] = sourceA;
			sources[sourceB.id] = sourceB;
			sources[sourceC.id] = sourceC;
			sources[sourceD.id] = sourceD;
			Game.getObjectById = id => sources[id];
			
			var object = new Handyman();
			object._findSources = room => [ sourceA, sourceB, sourceC ];

			assert.equal(sourceB, object._findClosestSource(new Creep('SOURCE_MODE_X')));
			return object;
		}
		
		describe('#findClosestSource', () => {
			it('source found', () => {
				var creep = new Creep('Handyman');
				creep.memory.source = 'C';

				var object = setupHandyman();
				
				assert.equal('C', object._findClosestSource(creep).id);
				assert.equal(0, info.getLines().length, info.getLines().toString());
			});
			
			it('source not valid', () => {
				// if it was not found in "findSources()", the source is not valid -> use anyway
				var creep = new Creep('Handyman');
				creep.memory.source = 'D';

				var object = setupHandyman();
				
				assert.equal('D', object._findClosestSource(creep).id);
				assert.equal(0, info.getLines().length, info.getLines().toString());
			});

			it('source not found', () => {
				// source is not even a game object -> error and wait
				var creep = new Creep('Handyman');
				creep.memory.source = 'E';

				var object = setupHandyman();
				
				assert.equal(null, object._findClosestSource(creep));
				assert.equal(1, info.getLines().length);
				assert.equal('🛑 Handyman could not find source: E', info.getLine(0));
			});
		});
	});
});
