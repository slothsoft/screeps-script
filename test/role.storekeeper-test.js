var StoreKeeper = require('../src/role.storekeeper');
var assert = require('assert');

var constants = require('../src/main.constants');
var info = require('../src/main.info');

var Creep = require('./mock/creep-mock');
var Room = require('./mock/room-mock.js');
var Spawn = require('./mock/spawn-mock');
var Store = require('./mock/store-mock.js');

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

		assert.equal(constants.SOURCE_USE_SOURCE, object.useStorageAsSource);
		assert.equal(constants.SOURCE_USE_STORAGE, object.useSourceAsSource);
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
			object.findTargets(room);
			
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
			object.findTargets(room);
			
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
			
			var object = new StoreKeeper();
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
			info.clearLog();
			
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
	});
	
	describe('#spawnCreep', () => {
		it('no creep', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 229;
			var object = new StoreKeeper();
			
			var creep = object.spawnCreep(spawn);
			assert.equal(false, creep);
		});

		it('creep with 1 x parts', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 230;
			var object = new StoreKeeper();
			
			var creep = object.spawnCreep(spawn);
			assert.equal(Game.creeps['Storekeeper 1'], creep);
			assert.deepEqual([MOVE, MOVE, MOVE, CARRY], creep.body);
		});

		it('creep with 2 x parts', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 460;
			var object = new StoreKeeper();
			
			var creep = object.spawnCreep(spawn);
			assert.equal(Game.creeps['Storekeeper 1'], creep);
			assert.deepEqual([MOVE, MOVE, MOVE, CARRY, MOVE, CARRY], creep.body);
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
			object.findSources(room);
			
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
			object.findSources(room);
			
			assert.equal(true, findWasCalled);
		});
	});
});
