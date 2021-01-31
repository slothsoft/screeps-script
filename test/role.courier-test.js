var Courier = require('../src/role.courier');
var assert = require('assert');

var constants = require('../src/main.constants');
var info = require('../src/main.info');

var MemoryManager = require('../src/manager.memory');

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

		it('loot tombstone', () => {
			var tombstone = { 
				pos: new RoomPosition(),
			};
			tombstone.pos.x = 12;
			tombstone.pos.y = 13;
			tombstone.store = new Store(100);
			tombstone.store.usedCapacity = 50;
			
			var creep = new Creep('run');
			creep.store = new Store(100);
			creep.pos.findInRange = (type) => (type == FIND_TOMBSTONES) ? [ tombstone ] : [];
			
			var object = new Courier();
			
			// tombstone is far away, so go there
			creep.pickup = resource => (resource == tombstone) ? ERR_NOT_IN_RANGE : -1;
			object._work = (workingCreep) => assert.fail('Creep cannot work while looting!');
			
			object.run(creep);

			assert.equal(12, creep.pos.x);
			assert.equal(13, creep.pos.y);
			
			// tombstone is close, so pickup
			creep.pickup = resource => (resource == tombstone) ? OK : -1;
			
			object.run(creep);

			assert.equal(12, creep.pos.x);
			assert.equal(13, creep.pos.y);
		});

		it('moveToGameObject', () => {
			
			var creep = new Creep('run');

			var gameObject = new Spawn();
			gameObject.pos.x = 13;
			gameObject.pos.y = 42;

			Game.getObjectById = id => id == gameObject.id ? gameObject : null;
			creep.memory.moveToGameObject = gameObject.id;
			
			var object = new Courier();
			object.run(creep);

			// game object is far away, so go there
			assert.equal(gameObject.pos.x, creep.pos.x);
			assert.equal(gameObject.pos.y, creep.pos.y);
			assert.equal(gameObject.id, creep.memory.moveToGameObject);

			// game object is now close, so remove game objects from memory and do normal work
			var workCalled = false;
			object._work = () => workCalled = true;
			object.run(creep);

			assert.equal(gameObject.pos.x, creep.pos.x);
			assert.equal(gameObject.pos.y, creep.pos.y);
			assert.equal(null, creep.memory.moveToGameObject);
			assert.equal(true, workCalled);
		});
	});

	describe('#isNecessary', () => {
		it('target present', () => {
			var room = new Room();
			room.memory.target = 'target';
			room.memory.source = 'source';

			MemoryManager.fetchRoomBase(room, 'Base');
			
			var object = new Courier();	
			MemoryManager._fetchRoomRoleConfig(room, [ object ]);
			room.memory.base.roleConfig.Courier.requiredNumber = 1;
			
			Game.getObjectById = (id) => id == 'target' ? new Spawn() : null;
			
			assert.equal(true, object.isNecessary(room));
		});

		it('no targets', () => {
			var room = new Room();
			room.memory.target = 'target';
			room.memory.source = 'source';

			MemoryManager.fetchRoomBase(room, 'Base');
			
			var object = new Courier();	
			MemoryManager._fetchRoomRoleConfig(room, [ object ]);
			room.memory.base.roleConfig.Courier.requiredNumber = 1;
			
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

	describe('TARGET_MODE_USE_OR_WAIT', () => {
		var setupCourier = function() {
			
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
			
			var object = new Courier();
			object._findTargets = room => [ targetA, targetB, targetC ];

			assert.equal(targetB, object._findClosestTarget(new Creep('TARGET_MODE_X')));
			return object;
		}
		
		describe('#findClosestTarget', () => {
			it('target found', () => {
				var creep = new Creep('Courier');
				creep.memory.target = 'C';

				var object = setupCourier();
				
				assert.equal('C', object._findClosestTarget(creep).id);
				assert.equal(0, info.getLines().length);
			});

			it('target not valid', () => {
				// if it was not found in "findTargets()", the target is not valid -> use anyway
				var creep = new Creep('Courier');
				creep.memory.target = 'D';

				var object = setupCourier();
				
				assert.equal('D', object._findClosestTarget(creep).id);
				assert.equal(0, info.getLines().length);
			});

			it('target not found', () => {
				// target is not even a game object -> error and wait
				var creep = new Creep('Courier');
				creep.memory.target = 'E';

				var object = setupCourier();
				
				assert.equal(null, object._findClosestTarget(creep));
				assert.equal(1, info.getLines().length);
				assert.equal('🛑 Courier could not find target: E', info.getLine(0));
			});
		});
	});

	describe('SOURCE_MODE_USE_OR_WAIT', () => {
		var setupCourier = function() {
			
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
			
			var object = new Courier();
			object._findSources = room => [ sourceA, sourceB, sourceC ];

			assert.equal(sourceB, object._findClosestSource(new Creep('SOURCE_MODE_X')));
			return object;
		}
		
		describe('#findClosestSource', () => {
			it('source found', () => {
				var creep = new Creep('Courier');
				creep.memory.source = 'C';

				var object = setupCourier();
				
				assert.equal('C', object._findClosestSource(creep).id);
				assert.equal(0, info.getLines().length, info.getLines().toString());
			});
			
			it('source not valid', () => {
				// if it was not found in "findSources()", the source is not valid -> use anyway
				var creep = new Creep('Courier');
				creep.memory.source = 'D';

				var object = setupCourier();
				
				assert.equal('D', object._findClosestSource(creep).id);
				assert.equal(0, info.getLines().length, info.getLines().toString());
			});

			it('source not found', () => {
				// source is not even a game object -> error and wait
				var creep = new Creep('Courier');
				creep.memory.source = 'E';

				var object = setupCourier();
				
				assert.equal(null, object._findClosestSource(creep));
				assert.equal(1, info.getLines().length);
				assert.equal('🛑 Courier could not find source: E', info.getLine(0));
			});
		});
	});
});
