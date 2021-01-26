var Courier = require('../src/role.courier');
var assert = require('assert');

var constants = require('../src/main.constants');
var info = require('../src/main.info');

var Creep = require('./mock/creep-mock');
var Room = require('./mock/room-mock');
var Spawn = require('./mock/spawn-mock');
var Store = require('./mock/store-mock');

// All methods tested.

describe('role.courier', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	});
	
	beforeEach(() => {
	    info.clearLines();
	});
	
	it('constructor', () => {
		var startsWith = 'class Courier';
		assert.equal(startsWith, Courier.toString().substring(0, startsWith.length));
		
		var object = new Courier();
		assert.equal('Courier', object.roleName);
		assert.equal('#ff8800', object.color);
		assert.equal('📯', object.symbol);
		assert.equal(-1, object.priority);
	});
	
	describe('#findTargets', () => {
		it('find correct structures', () => {
			 // TODO: target should not be stored directly on the room
			var room = new Room();
			room.memory.target = '12345';
			
			var findWasCalled = false;
			Game.getObjectById = (id) => {
				findWasCalled = true;
				
				assert.equal('12345', id);
				return 'result';
			};

			var object = new Courier();
			assert.deepEqual(['result'], object._findTargets(room));
			assert.equal(true, findWasCalled);
		});
		
		it('no structure found', () => {
			var room = new Room();
			room.name = 'R2';
			
			Game.getObjectById = (id) => null;

			var object = new Courier();
			assert.deepEqual([], object._findTargets(room));
			assert.equal(1, info.getLines().length);
			assert.equal('🛑 R2 could not find game object with ID: undefined', info.getLine(0));
		});
	});

	describe('#findSources', () => {
		it('find correct structures', () => {
			 // TODO: source should not be stored directly on the room
			var room = new Room();
			room.memory.source = '67890';
			
			var findWasCalled = false;
			Game.getObjectById = (id) => {
				findWasCalled = true;
				
				assert.equal('67890', id);
				return 'result';
			};

			var object = new Courier();
			assert.deepEqual(['result'], object._findSources(room));
			assert.equal(true, findWasCalled);
		});
		
		it('no structure found', () => {
			var room = new Room();
			room.name = 'R1';
			room.memory.source = '67890';
			
			Game.getObjectById = (id) => null;

			var object = new Courier();
			assert.deepEqual([], object._findSources(room));
			assert.equal(1, info.getLines().length);
			assert.equal('🛑 R1 could not find game object with ID: 67890', info.getLine(0));
		});
	});

	describe('#findById', () => {
		it('find correct structures', () => {
			var room = new Room();
			
			var findWasCalled = false;
			Game.getObjectById = (id) => {
				findWasCalled = true;
				assert.equal('74102', id);
				return 'result';
			};

			var object = new Courier();
			assert.deepEqual(['result'], object._findById(room, '74102'));
			assert.equal(true, findWasCalled);
		});
		
		it('no structure found', () => {
			var room = new Room();
			room.name = 'R3';
			
			Game.getObjectById = (id) => null;

			var object = new Courier();
			assert.deepEqual([], object._findById(room, '74102'));
			assert.equal(1, info.getLines().length);
			assert.equal('🛑 R3 could not find game object with ID: 74102', info.getLine(0));
		});
	});

	describe('#handleSourceWorkResult', () => {
		it('any error', () => {
			var room = new Room();

			var creep = new Creep();
			creep.name = 'Courier 123';
			
			var object = new Courier();
			object._handleSourceWorkResult(creep, ERR_INVALID_ARGS);

			assert.equal(1, info.getLines().length);
			assert.equal('⚠ Courier 123 cannot harvest: -10', info.getLine(0));
		});
		
		it('tired', () => {
			var room = new Room();

			var creep = new Creep();
			creep.name = 'Courier 123';
			
			var object = new Courier();
			object._handleSourceWorkResult(creep, ERR_TIRED);

			assert.equal(0, info.getLines().length);
			assert.equal(true, creep.memory.working);
		});
	});

	describe('#work (via run)', () => {
		it('lifecycle (oxygen)', () => {
			
			var creep = new Creep('work', [CARRY, CARRY]);
			creep.store.usedCapacity = 50;
			creep.store[RESOURCE_OXYGEN] = creep.store;
			
			var room = creep.room;
			room.memory.target = 'target';
			room.memory.source = 'source';
			
			var mineral = new Spawn();
			mineral.pos.x = 13;
			mineral.pos.y = 42;
	
			var lab = new Spawn();
			lab.pos.x = 23;
			lab.pos.y = 6;
			
			var object = new Courier();
			object._findById = (room, id) => (id == 'target') ? [ lab ] : [ mineral ];
			
			// store is half full, so first travel to source
			object.run(creep);
	
			assert.equal(50, creep.store[RESOURCE_OXYGEN].getUsedCapacity());
			assert.equal(100, creep.store[RESOURCE_OXYGEN].getCapacity());
			assert.equal(mineral.pos.x, creep.pos.x);
			assert.equal(mineral.pos.y, creep.pos.y);
	
			// store is still half full, so harvest source
			object.run(creep);
	
			assert.equal(100, creep.store[RESOURCE_OXYGEN].getUsedCapacity());
			assert.equal(100, creep.store[RESOURCE_OXYGEN].getCapacity());
			assert.equal(mineral.pos.x, creep.pos.x);
			assert.equal(mineral.pos.y, creep.pos.y);
	
			// store is full, target is out of range, so move to target
			object.run(creep);
	
			assert.equal(100, creep.store[RESOURCE_OXYGEN].getUsedCapacity());
			assert.equal(100, creep.store[RESOURCE_OXYGEN].getCapacity());
			assert.equal(lab.pos.x, creep.pos.x);
			assert.equal(lab.pos.y, creep.pos.y);
	
			// store is full, target is in range, so work
			object.run(creep);
	
			assert.equal(null, creep.store[RESOURCE_OXYGEN]);
			assert.equal(0, creep.store.getUsedCapacity());
			assert.equal(100, creep.store.getCapacity());
			assert.equal(lab.pos.x, creep.pos.x);
			assert.equal(lab.pos.y, creep.pos.y);
	
			// 2) store is empty, so first travel to source
			object.run(creep);
	
			assert.equal(null, creep.store[RESOURCE_OXYGEN]);
			assert.equal(0, creep.store.getUsedCapacity());
			assert.equal(100, creep.store.getCapacity());
			assert.equal(mineral.pos.x, creep.pos.x);
			assert.equal(mineral.pos.y, creep.pos.y);
		});
		
		it('self-destruct', () => {
			info.clearLines();
			
			var creep = new Creep('run');
			creep.memory.selfdestruct = true;

			var spawn = new Spawn();
			spawn.pos.x = 13;
			spawn.pos.y = 42;
			creep.pos.findClosestByPath = type => spawn;
			
			var object = new Courier();
			
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
			
			var object = new Courier();
			
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

	describe('#isNecessary', () => {
		it('target present', () => {
			var room = new Room();
			room.memory.target = 'target';
			room.memory.source = 'source';
			
			var object = new Courier();	
			Game.getObjectById = (id) => id == 'target' ? new Spawn() : null;
			
			assert.equal(true, object.isNecessary(room));
		});

		it('no targets', () => {
			var room = new Room();
			room.memory.target = 'target';
			room.memory.source = 'source';
			
			var object = new Courier();	
			Game.getObjectById = (id) => null;
			
			assert.equal(false, object.isNecessary(room));
		});

		it('no source defined', () => {
			var room = new Room();
			room.memory.target = 'target';
			
			var object = new Courier();	
			Game.getObjectById = (id) => new Spawn();
			
			assert.equal(false, object.isNecessary(room));
		});

		it('no target defined', () => {
			var room = new Room();
			room.memory.source = 'source';
			
			var object = new Courier();	
			Game.getObjectById = (id) => new Spawn();
			
			assert.equal(false, object.isNecessary(room));
		});
	});
});
