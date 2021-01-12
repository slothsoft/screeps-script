var Harvester = require('../src/role.harvester');
var assert = require('assert');

var info = require('../src/main.info');

var Creep = require('./mock/creep-mock');
var Room = require('./mock/room-mock.js');
var Spawn = require('./mock/spawn-mock');
var Store = require('./mock/store-mock.js');

// All methods tested.

describe('role.harvester', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	    global.Game = require('./mock/game-mock').Game;
	});
	
	it('constructor', () => {
		var startsWith = 'class Harvester';
		assert.equal(startsWith, Harvester.toString().substring(0, startsWith.length));
		
		var object = new Harvester();
		assert.equal('Harvester', object.roleName);
		assert.equal(2, object.requiredNumber);
		assert.equal('#ffffff', object.color);
		assert.equal('🧺', object.symbol);
		assert.equal(100, object.priority);

		assert.equal(false, object.useStorageAsSource);
		assert.equal(true, object.useSourceAsSource);
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

			var object = new Harvester();
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

			var object = new Harvester();
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

			var object = new Harvester();
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
			
			var object = new Harvester();
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
			
			var object = new Harvester();
			
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
});
