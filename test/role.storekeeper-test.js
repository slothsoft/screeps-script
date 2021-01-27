var StoreKeeper = require('../src/role.storekeeper');
var assert = require('assert');

var constants = require('../src/main.constants');
var info = require('../src/main.info');

var Creep = require('./mock/creep-mock');
var Room = require('./mock/room-mock');
var Spawn = require('./mock/spawn-mock');
var Store = require('./mock/store-mock');

// All methods tested.

describe('role.storekeeper', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	});

	it('constructor', () => {
		var startsWith = 'class StoreKeeper';
		assert.equal(startsWith, StoreKeeper.toString().substring(0, startsWith.length));
		
		var object = new StoreKeeper();
		assert.equal('Storekeeper', object.roleName);
		assert.equal('#ff9900', object.color);
		assert.equal('🏭', object.symbol);
		assert.equal(-1, object.priority);
	});

	describe('#isNecessary', () => {
		it('always necessary', () => {
			var object = new StoreKeeper();
			assert.equal(true, object.isNecessary());
		});
	});
	
	describe('#findTargets', () => {
		it('find correct structures', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				
				var filter = opt.filter;
				
				var structure = {};
				structure.store = new Store(100);
				
				structure.structureType = STRUCTURE_EXTENSION;
				assert.equal(true, filter(structure));

				structure.structureType = STRUCTURE_SPAWN;
				assert.equal(true, filter(structure));

				structure.structureType = STRUCTURE_TOWER;
				assert.equal(true, filter(structure));
			};

			var object = new StoreKeeper();
			object._findTargets(room);
			
			assert.equal(true, findWasCalled);
		});

		it('reject wrong structures', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				
				var filter = opt.filter;
				
				var structure = {};
				structure.store = new Store(100);
				
				structure.structureType = STRUCTURE_WALL;
				assert.equal(false, filter(structure));

				structure.structureType = STRUCTURE_ROAD;
				assert.equal(false, filter(structure));

				structure.structureType = STRUCTURE_RAMPART;
				assert.equal(false, filter(structure));
			};

			var object = new StoreKeeper();
			object._findTargets(room);
			
			assert.equal(true, findWasCalled);
		});

		it('reject full structures', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				
				var filter = opt.filter;
				
				var structure = {};
				structure.store = new Store(100);
				structure.store.usedCapacity = 100;
				
				structure.structureType = STRUCTURE_EXTENSION;
				assert.equal(false, filter(structure));

				structure.structureType = STRUCTURE_SPAWN;
				assert.equal(false, filter(structure));

				structure.structureType = STRUCTURE_TOWER;
				assert.equal(false, filter(structure));
			};

			var object = new StoreKeeper();
			object._findTargets(room);
			
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
			
			var object = new StoreKeeper();
			object._findSources = room => [ source ];
			object._findTargets = room => [ target ];
			
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
	
			assert.equal(null, creep.store[RESOURCE_ENERGY]);
			assert.equal(0, creep.store.getUsedCapacity());
			assert.equal(100, creep.store.getCapacity());
			assert.equal(target.pos.x, creep.pos.x);
			assert.equal(target.pos.y, creep.pos.y);
	
			// 2) store is empty, so first travel to source
			object.run(creep);
	
			assert.equal(null, creep.store[RESOURCE_ENERGY]);
			assert.equal(0, creep.store.getUsedCapacity());
			assert.equal(100, creep.store.getCapacity());
			assert.equal(source.pos.x, creep.pos.x);
			assert.equal(source.pos.y, creep.pos.y);
		});
		
		it('self-destruct', () => {
			info.clearLines();
			
			var creep = new Creep('run');
			creep.memory.selfdestruct = true;

			var spawn = new Spawn();
			spawn.pos.x = 13;
			spawn.pos.y = 42;
			creep.pos.findClosestByPath = type => spawn;
			
			var object = new StoreKeeper();
			
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
			
			var object = new StoreKeeper();
			
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
	
	describe('#spawnCreep', () => {
		it('no creep', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 129;
			var object = new StoreKeeper();
			
			var creep = object.spawnCreep(spawn);
			assert.equal(false, creep);
		});

		it('creep with 1 x parts', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 130;
			var object = new StoreKeeper();
			
			var creep = object.spawnCreep(spawn);
			assert.equal(Game.creeps['Storekeeper 1'], creep);
			assert.deepEqual([MOVE, CARRY], creep.body);
		});

		it('creep with 2 x parts', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 360;
			var object = new StoreKeeper();
			
			var creep = object.spawnCreep(spawn);
			assert.equal(Game.creeps['Storekeeper 1'], creep);
			assert.deepEqual([MOVE, CARRY, MOVE, CARRY], creep.body);
		});
	});

	describe('#findSources', () => {
		it('find correct structures', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				
				var filter = opt.filter;

				var structure = {};
				structure.store = new Store(100, 50);
				
				structure.structureType = STRUCTURE_STORAGE;
				assert.equal(true, filter(structure));

				structure.structureType = STRUCTURE_CONTAINER;
				assert.equal(true, filter(structure));
			};

			var object = new StoreKeeper();
			object._findSources(room);
			
			assert.equal(true, findWasCalled);
		});

		it('reject full structures', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				
				var filter = opt.filter;
				
				var structure = {};
				structure.store = new Store(100);
				structure.store.usedCapacity = 100;
				
				structure.structureType = STRUCTURE_EXTENSION;
				assert.equal(false, filter(structure));

				structure.structureType = STRUCTURE_SPAWN;
				assert.equal(false, filter(structure));

				structure.structureType = STRUCTURE_TOWER;
				assert.equal(false, filter(structure));
			};

			var object = new StoreKeeper();
			object._findSources(room);
			
			assert.equal(true, findWasCalled);
		});
	});
	describe('TARGET_MODE_USE_IF_VALID', () => {
		var setupStoreKeeper = function() {
			
			// this is the default set up (see #findClosestTarget)
	
			var targetA = new Spawn(null, 'A');
			targetA.pos.x = 4;
	
			var targetB = new Spawn(null, 'B');
			targetB.pos.x = 1;
	
			var targetC = new Spawn(null, 'C');
			targetC.pos.x = 10;
	
			var targetD = new Spawn(null, 'D');
			targetD.pos.x = 11;
			
			var targets = [];
			targets[targetA.id] = targetA;
			targets[targetB.id] = targetB;
			targets[targetC.id] = targetC;
			targets[targetD.id] = targetD;
			Game.getObjectById = id => targets[id];
			
			var object = new StoreKeeper();
			object._findTargets = room => [ targetA, targetB, targetC ];

			assert.equal(targetB, object._findClosestTarget(new Creep('TARGET_MODE_X')));
			return object;
		}
		
		describe('#findClosestTarget', () => {
			it('target found', () => {
				var creep = new Creep('StoreKeeper');
				creep.memory.target = 'C';

				var object = setupStoreKeeper();
				
				assert.equal('C', object._findClosestTarget(creep).id);
				assert.equal(0, info.getLines().length, info.getLines().toString());
			});

			it('target not valid', () => {
				// if it was not found in "findTargets()", the target is not valid -> use other
				var creep = new Creep('StoreKeeper');
				creep.memory.target = 'D';

				var object = setupStoreKeeper();
				
				assert.equal('B', object._findClosestTarget(creep).id);
				assert.equal(0, info.getLines().length, info.getLines().toString());
			});
			
			it('target not found', () => {
				// target is not even a game object -> error and use other
				var creep = new Creep('StoreKeeper');
				creep.memory.target = 'E';

				var object = setupStoreKeeper();
				
				assert.equal('B', object._findClosestTarget(creep).id);
				assert.equal(1, info.getLines().length);
				assert.equal('🛑 StoreKeeper could not find target: E', info.getLine(0));
			});
		});
	});
});
