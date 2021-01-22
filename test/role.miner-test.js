var Miner = require('../src/role.miner');
var assert = require('assert');

var constants = require('../src/main.constants');
var info = require('../src/main.info');
var game = require('../src/main.game');

var MemoryManager = require('../src/manager.memory');

var Creep = require('./mock/creep-mock');
var Room = require('./mock/room-mock');
var Spawn = require('./mock/spawn-mock');
var Store = require('./mock/store-mock');

// All methods tested.

describe('role.miner', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	});
	
	beforeEach(() => {
		Game.clearAll();
	});
	
	it('constructor', () => {
		var startsWith = 'class Miner';
		assert.equal(startsWith, Miner.toString().substring(0, startsWith.length));
		
		var object = new Miner();
		assert.equal('Miner', object.roleName);
		assert.equal('#000000', object.color);
		assert.equal('🛒', object.symbol);
		assert.equal(-1, object._priority);

		assert.equal(constants.SOURCE_USE_SOURCE, object._useStorageAsSource);
		assert.equal(constants.SOURCE_USE_STORAGE, object._useSourceAsSource);
	});

	describe('#isNecessary', () => {
		it('always necessary', () => {
			var object = new Miner();
			assert.equal(true, object.isNecessary());
		});
	});

	describe('#getPartsMaxMultiplier', () => {
		it('always 5', () => {
			var object = new Miner();
			assert.equal(6, object._getPartsMaxMultiplier());
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
				
				structure.structureType = STRUCTURE_STORAGE;
				assert.equal(true, filter(structure));

				structure.structureType = STRUCTURE_CONTAINER;
				assert.equal(true, filter(structure));

				structure.structureType = STRUCTURE_LINK;
				game.fetchMemoryOfStructure(structure).type = 'source';
				assert.equal(true, filter(structure));
			};

			var object = new Miner();
			object._findTargets(room);
			
			assert.equal(true, findWasCalled);
		});

		it('find correct structures with creep', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				
				var filter = opt.filter;
				
				var structure = {};
				structure.store = new Store(100);
				
				structure.structureType = STRUCTURE_STORAGE;
				assert.equal(true, filter(structure));

				structure.structureType = STRUCTURE_CONTAINER;
				assert.equal(true, filter(structure));

				structure.structureType = STRUCTURE_LINK;
				game.fetchMemoryOfStructure(structure).type = 'source';
				assert.equal(true, filter(structure));
			};

			var object = new Miner();
			
			object.creep = new Creep();
			object.creep.room = room;
			object.creep.pos.inRangeTo = (structure, range) => true;
			
			object._findTargets(room);
			
			assert.equal(true, findWasCalled);
		});


		it('reject targets too far away', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				
				var filter = opt.filter;
				
				var structure = {};
				structure.store = new Store(100);
				
				structure.structureType = STRUCTURE_STORAGE;
				assert.equal(false, filter(structure));

				structure.structureType = STRUCTURE_CONTAINER;
				assert.equal(false, filter(structure));

				structure.structureType = STRUCTURE_LINK;
				game.fetchMemoryOfStructure(structure).type = 'source';
				assert.equal(false, filter(structure));
			};

			var object = new Miner();
			
			object.creep = new Creep();
			object.creep.room = room;
			object.creep.pos.inRangeTo = (structure, range) => false;
			object.creep.memory.ticksToSource = 1500;
			
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
				
				structure.structureType = STRUCTURE_LINK;
				game.fetchMemoryOfStructure(structure).type = constants.LINK_TYPE_TARGET;
				assert.equal(false, filter(structure));
			};

			var object = new Miner();
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

			var object = new Miner();
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
			
			var object = new Miner();
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
			var creep = new Creep('run');
			creep.memory.selfdestruct = true;

			var spawn = new Spawn();
			spawn.pos.x = 13;
			spawn.pos.y = 42;
			creep.pos.findClosestByPath = type => spawn;
			
			var object = new Miner();
			
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
			droppedEnergy.pos.x = 12;
			droppedEnergy.pos.y = 13;
			
			var creep = new Creep('run');
			creep.store = new Store(100);
			creep.pos.findInRange = (type) => (type == FIND_DROPPED_RESOURCES) ? [ droppedEnergy ] : [];
			
			var object = new Miner();
			
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
		
		it('train replacement', () => {
			
			var creep = new Creep('work', [CARRY, CARRY]);
			creep.store.usedCapacity = 50;
			creep.store[RESOURCE_ENERGY] = creep.store;
			
			var source = new Spawn();
			source.pos.x = 13;
			source.pos.y = 42;
	
			var target = new Spawn();
			target.pos.x = 23;
			target.pos.y = 6;
			
			var object = new Miner();
			object._findSources = room => [ source ];
			object.findTargets = room => [ target ];
			
			// Remember when I was spawned (+ travel to source)
			creep.ticksToLive = 1500;
			
			object.run(creep);
			
			assert.equal(1500, creep.memory.initialTicksToLive);
			
			// make sure we are at source
			assert.equal(50, creep.store[RESOURCE_ENERGY].getUsedCapacity());
			assert.equal(100, creep.store[RESOURCE_ENERGY].getCapacity());
			assert.equal(source.pos.x, creep.pos.x);
			assert.equal(source.pos.y, creep.pos.y);
	
			// Remember when we first arrived at source (+ harvest source)
			creep.ticksToLive = 1400;
			
			object.run(creep);

			assert.equal(1400, creep.memory.ticksToSource);

			// make sure we harvested source
			assert.equal(100, creep.store[RESOURCE_ENERGY].getUsedCapacity());
			assert.equal(100, creep.store[RESOURCE_ENERGY].getCapacity());
			assert.equal(source.pos.x, creep.pos.x);
			assert.equal(source.pos.y, creep.pos.y);
	
			// Moving to source takes 100 ticks - make sure replacement is respawned 
			creep.ticksToLive = 100;
			creep.memory.homeSpawn = 'Spawn';
			creep.memory.homeSource = 'Source';
			
			var spawnCalled = false;
			object.spawnCreepFromSpawnName = (spawnName, sourceId) => {
				assert.equal('Spawn', spawnName);
				assert.equal('Source', sourceId);
				spawnCalled = true;
			};
		
			object.run(creep);

			assert.equal(true, spawnCalled);
		});
	});

	describe('#findSources', () => {
		it('found', () => {

			var creep = new Creep('findSources');
			creep.memory.homeSource = 'Home sweet home.';
			
			var source = new Spawn();
			source.pos.x = 13;
			source.pos.y = 42;

			var room = new Room();
			room.find = (type, opt) => source;
	
			var object = new Miner();
			object.creep = creep;
			assert.deepEqual(source, object._findSources(room));
		});

		it('not found', () => {
			info.clearLines();

			var creep = new Creep('findSources');
			creep.memory.homeSource = 'Home sweet home.';
			
			var room = new Room();
			room.find = (type, opt) => [];
	
			var object = new Miner();
			object.creep = creep;
			assert.deepEqual([], object._findSources(room));

			assert.equal(1, info.getLines().length);
			assert.equal('🛑 Could not find source: Home sweet home.', info.getLine(0));
		});
	});

	describe('#spawnCreepFromSpawn', () => {
		it('no spawn', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 50;
			
			var object = new Miner();
			
			var creep = object._spawnCreepFromSpawn(spawn, 'Source');
			assert.equal(false, creep);
		});
		
		it('spawn', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 300;
			
			var object = new Miner();
			
			var creep = object._spawnCreepFromSpawn(spawn, 'Source');
			assert.equal(spawn.name, creep.memory.homeSpawn);
			assert.equal('Source', creep.memory.homeSource);
			assert.equal(Game.creeps['Miner 1'], creep);
			assert.deepEqual([MOVE, CARRY, WORK], creep.body);
		});

		it('no source', () => {
			info.clearLines();
			
			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 77;
			
			var object = new Miner();
			
			var creep = object._spawnCreepFromSpawn(spawn);
			assert.equal(false, creep);
			
			assert.equal(1, info.getLines().length);
			assert.equal('🛑 The source is mandatory!', info.getLine(0));
		});
	});

	describe('#spawnCreepFromSpawnName', () => {
		it('no spawn', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 50;
			
			var object = new Miner();
			
			var creep = object.spawnCreepFromSpawnName(spawn.name, 'Source');
			assert.equal(false, creep);
		});
		
		it('spawn', () => {
			info.clearLines();

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 300;
			
			var object = new Miner();
			
			var creep = object.spawnCreepFromSpawnName(spawn.name, 'Source');
			assert.notEqual(false, creep);
			assert.equal(spawn.name, creep.memory.homeSpawn);
			assert.equal('Source', creep.memory.homeSource);
			assert.equal(Game.creeps['Miner 1'], creep);
			assert.deepEqual([MOVE, CARRY, WORK], creep.body);

			assert.equal(1, info.getLines().length);
			assert.equal('🛒 Spawning new Miner (3p)', info.getLine(0));
		});

		it('no spawn', () => {
			info.clearLines();
			
			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 77;
			
			var object = new Miner();
			
			var creep = object.spawnCreepFromSpawnName('ABC');
			assert.equal(false, creep);
			
			assert.equal(1, info.getLines().length);
			assert.equal('🛑 Could not find spawn: ABC', info.getLine(0));
		});
	});

	describe('#spawnCreep', () => {
		it('find correct source', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 50;

			var source = new Spawn();
			spawn.room.find = (type) => [ source ];
			
			var object = new Miner();
			
			var spawnWasCalled = false;
			object._spawnCreepFromSpawn = (usedSpawn, sourceId) => {
				assert.deepEqual(spawn, usedSpawn);
				assert.equal(source.id, sourceId);
				spawnWasCalled = true;
			};

			var creep = object.spawnCreep(spawn);
			assert.equal(true, spawnWasCalled);
		});

		it('no source found', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 50;
			spawn.room.find = (type) => [ ];
			
			var object = new Miner();
			
			var spawnWasCalled = false;
			object._spawnCreepFromSpawn = (usedSpawn, sourceId) => {
				spawnWasCalled = true;
			};
			
			var creep = object.spawnCreep(spawn);
			assert.equal(false, creep);
			assert.equal(false, spawnWasCalled);
		});
		
		it('find correct source ignore claimed', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 50;

			var source1 = new Spawn();
			var creep1 = new Creep();
			creep1.memory.homeSource = source1.id;
			
			var source2 = new Spawn();
			var creep2 = new Creep();
			creep2.memory.homeSource = source2.id;
			
			var source3 = new Spawn();

			game.findAllCreeps = () => [ creep1, creep2 ];
			spawn.room.find = (type) => [ source1, source2, source3 ];
			
			var object = new Miner();
			
			var spawnWasCalled = false;
			object._spawnCreepFromSpawn = (usedSpawn, sourceId) => {
				assert.deepEqual(spawn, usedSpawn);
				assert.equal(source3.id, sourceId);
				spawnWasCalled = true;
			};

			var creep = object.spawnCreep(spawn);
			assert.equal(true, spawnWasCalled);
		});
		
		it('all claimed', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 50;

			var source1 = new Spawn();
			var creep1 = new Creep();
			creep1.memory.homeSource = source1.id;
			
			var source2 = new Spawn();
			var creep2 = new Creep();
			creep2.memory.homeSource = source2.id;
			
			var source3 = new Spawn();
			var creep3 = new Creep();
			creep3.memory.homeSource = source3.id;

			game.findAllCreeps = () => [ creep1, creep2, creep3 ];
			spawn.room.find = (type) => [ source1, source2, source3 ];
			
			var object = new Miner();

			var spawnWasCalled = false;
			object._spawnCreepFromSpawn = (usedSpawn, sourceId) => {
				spawnWasCalled = true;
			};
			
			var creep = object.spawnCreep(spawn);
			assert.equal(false, creep);
			assert.equal(false, spawnWasCalled);
		});
	});
});
