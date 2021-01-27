var RolePrototype = require('../src/role.prototype');
var assert = require('assert');

require('./mock/game-mock');
var info = require('../src/main.info');

var Creep = require('./mock/creep-mock');
var Room = require('./mock/room-mock');
var RoomPosition = require('./mock/room-position-mock');
var Spawn = require('./mock/spawn-mock');
var Store = require('./mock/store-mock');

// All methods tested.

describe('role.protoype', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	});
	
	beforeEach(() => {
		Game.clearAll();
		info.clearLines();
	});
	
	it('exists', () => {
		var startsWith = 'class RolePrototype';
		assert.equal(startsWith, RolePrototype.toString().substring(0, startsWith.length));
	});

	describe('#constructor', () => {
		it('noArgs', () => {
			var object = new RolePrototype();

			assert.equal('Prototype', object.roleName);
			assert.equal('#ff0000', object.color);
			assert.equal('❗', object.symbol);
		});

		it('args', () => {
			var object = new RolePrototype('Role', 'green', '🎗');

			assert.equal('Role', object.roleName);
			assert.equal('green', object.color);
			assert.equal('🎗', object.symbol);
		});
	});

	describe('#calculateCostsForSinglePart', () => {
		it('MOVE', () => {
			var object = new RolePrototype();
			assert.equal('50', object._calculateCostsForSinglePart(MOVE));
		});

		it('WORK', () => {
			var object = new RolePrototype();
			assert.equal('100', object._calculateCostsForSinglePart(WORK));
		});
	});

	describe('#calculateCostsForParts', () => {
		it('empty', () => {
			var object = new RolePrototype();
			assert.equal('0', object._calculateCostsForParts([]));
		});

		it('WORK', () => {
			var object = new RolePrototype();
			assert.equal('100', object._calculateCostsForParts([WORK]));
		});

		it('MOVE, WORK', () => {
			var object = new RolePrototype();
			assert.equal('150', object._calculateCostsForParts([WORK, MOVE]));
		});
	});

	describe('#getPartsMinMultiplier', () => {
		it('default', () => {
			var object = new RolePrototype();
			
			assert.equal(0, object._getPartsMinMultiplier(new Spawn()));
		});

		it('set', () => {
			var spawn = new Spawn();
			spawn.room.memory.base = { roleConfig : { partsMinMultiplier : 2 } };
			
			var object = new RolePrototype();
			
			assert.equal(2, object._getPartsMinMultiplier(spawn));
		});
	});

	describe('#getPartsMaxMultiplier', () => {
		it('default', () => {
			var object = new RolePrototype();
			
			assert.equal(5, object._getPartsMaxMultiplier(new Spawn()));
		});

		it('set', () => {
			var spawn = new Spawn();
			spawn.room.memory.base = { roleConfig : { partsMaxMultiplier : 7 } };
			
			var object = new RolePrototype();
			
			assert.equal(7, object._getPartsMaxMultiplier(spawn));
		});
	});
	
	describe('#replicateParts', () => {
		it('0 parts x 0', () => {
			var object = new RolePrototype();
			
			assert.deepEqual([], object._replicateParts([], 0));
		});
		
		it('1 parts x 0', () => {
			var object = new RolePrototype();
			
			assert.deepEqual([], object._replicateParts([MOVE], 0));
		});

		it('2 parts x 0', () => {
			var object = new RolePrototype();
			
			assert.deepEqual([], object._replicateParts([MOVE, WORK], 0));
		});

		it('0 parts x 1', () => {
			var object = new RolePrototype();
			
			assert.deepEqual([], object._replicateParts([], 1));
		});
		
		it('1 parts x 1', () => {
			var object = new RolePrototype();
			
			assert.deepEqual([MOVE], object._replicateParts([MOVE], 1));
		});

		it('2 parts x 1', () => {
			var object = new RolePrototype();
			
			assert.deepEqual([MOVE, WORK], object._replicateParts([MOVE, WORK], 1));
		});

		it('0 parts x 2', () => {
			var object = new RolePrototype();
			
			assert.deepEqual([], object._replicateParts([], 2));
		});
		
		it('1 parts x 2', () => {
			var object = new RolePrototype();
			
			assert.deepEqual([MOVE, MOVE], object._replicateParts([MOVE], 2));
		});

		it('2 parts x 2', () => {
			var object = new RolePrototype();
			
			assert.deepEqual([MOVE, WORK, MOVE, WORK], object._replicateParts([MOVE, WORK], 2));
		});
	});

	describe('#calculateMaxParts', () => {
		it('0 parts 0 single => 0', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 0;
			
			var object = new RolePrototype();
			
			assert.equal(null, object._calculateMaxParts(spawn, []));
		});

		it('1 parts 0 single => 0', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 0;
			
			var object = new RolePrototype();
			
			assert.equal(null, object._calculateMaxParts(spawn, [MOVE]));
		});

		it('1 parts 0 single => 1', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 50;
			
			var object = new RolePrototype();
			
			assert.deepEqual([MOVE], object._calculateMaxParts(spawn, [MOVE]));
		});

		it('1 parts 0 single => 2', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 100;
			
			var object = new RolePrototype();
			
			assert.deepEqual([MOVE, MOVE], object._calculateMaxParts(spawn, [MOVE]));
		});

		it('2 parts 0 single => 0', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 50;
			
			var object = new RolePrototype();
			
			assert.equal(null, object._calculateMaxParts(spawn, [MOVE, MOVE]));
		});

		it('2 parts 0 single => 1', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 110;
			
			var object = new RolePrototype();
			
			assert.deepEqual([MOVE, MOVE], object._calculateMaxParts(spawn, [MOVE, MOVE]));
		});

		it('2 parts 0 single => 2', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 299;
			
			var object = new RolePrototype();
			
			assert.deepEqual([MOVE, MOVE, MOVE, MOVE], object._calculateMaxParts(spawn, [MOVE, MOVE]));
		});

		it('0 parts 1 single => 0', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 0;
			
			var object = new RolePrototype();
			
			assert.equal(null, object._calculateMaxParts(spawn, [], [WORK]));
		});

		it('1 parts 1 single => 0', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 0;
			
			var object = new RolePrototype();
			
			assert.equal(null, object._calculateMaxParts(spawn, [MOVE], [ATTACK]));
		});

		it('1 parts 1 single => 1', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 100;
			
			var object = new RolePrototype();
			
			assert.deepEqual([ATTACK, MOVE], object._calculateMaxParts(spawn, [MOVE], [ATTACK]));
		});

		it('1 parts 1 single => 2', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 150;
			
			var object = new RolePrototype();
			
			assert.deepEqual([ATTACK, MOVE, MOVE], object._calculateMaxParts(spawn, [MOVE], [ATTACK]));
		});

		it('2 parts 1 single => 0', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 149;
			
			var object = new RolePrototype();
			
			assert.equal(null, object._calculateMaxParts(spawn, [MOVE, MOVE], [ATTACK]));
		});

		it('2 parts 1 single => 1', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 150;
			
			var object = new RolePrototype();
			
			assert.deepEqual([ATTACK, MOVE, MOVE], object._calculateMaxParts(spawn, [MOVE, MOVE], [ATTACK]));
		});

		it('2 parts 1 single => 2', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 299;
			
			var object = new RolePrototype();
			
			assert.deepEqual([ATTACK, MOVE, MOVE, MOVE, MOVE], object._calculateMaxParts(spawn, [MOVE, MOVE], [ATTACK]));
		});

		it('1 parts 2 single => 2', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 250;
			
			var object = new RolePrototype();
			
			assert.deepEqual([ATTACK, WORK, MOVE, MOVE], object._calculateMaxParts(spawn, [MOVE], [ATTACK, WORK]));
		});

		it('2 parts 2 single => 0', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 249;
			
			var object = new RolePrototype();
			
			assert.equal(null, object._calculateMaxParts(spawn, [MOVE, MOVE], [ATTACK, WORK]));
		});

		it('2 parts 2 single => 1', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 250;
			
			var object = new RolePrototype();
			
			assert.deepEqual([ATTACK, WORK, MOVE, MOVE], object._calculateMaxParts(spawn, [MOVE, MOVE], [ATTACK, WORK]));
		});

		it('2 parts 2 single => 2', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 399;
			
			var object = new RolePrototype();
			
			assert.deepEqual([ATTACK, WORK, MOVE, MOVE, MOVE, MOVE], object._calculateMaxParts(spawn, [MOVE, MOVE], [ATTACK, WORK]));
		});
	});

	describe('#spawnCreepWithParts', () => {
		it('default => no creep', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 50;
			var object = new RolePrototype();
			
			var creep = object._spawnCreepWithParts(spawn, [WORK, MOVE]);
			assert.equal(false, creep);
		});

		it('default => creep with 1 x parts', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 150;
			var object = new RolePrototype();
			
			var creep = object._spawnCreepWithParts(spawn, [MOVE, WORK]);
			assert.equal(Game.creeps['Prototype 1'], creep);
			assert.deepEqual([MOVE, WORK], creep.body);
		});

		it('default => creep with 2 x parts', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 449;
			var object = new RolePrototype();
			
			var creep = object._spawnCreepWithParts(spawn, [WORK, MOVE]);
			assert.equal(Game.creeps['Prototype 1'], creep);
			assert.deepEqual([WORK, MOVE, WORK, MOVE], creep.body);
		});

		it('plus single => no creep', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 650;
			var object = new RolePrototype();
			
			var creep = object._spawnCreepWithParts(spawn, [WORK, MOVE, CLAIM], [CLAIM]);
			assert.equal(false, creep);
		});

		it('plus single => creep with 1 x parts', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 750;
			var object = new RolePrototype();
			
			var creep = object._spawnCreepWithParts(spawn, [MOVE, WORK], [CLAIM]);
			assert.equal(Game.creeps['Prototype 1'], creep);
			assert.deepEqual([CLAIM, MOVE, WORK], creep.body);
		});

		it('plus single => creep with 2 x parts', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 1049;
			var object = new RolePrototype();
			
			var creep = object._spawnCreepWithParts(spawn, [WORK, MOVE], [CLAIM]);
			assert.equal(Game.creeps['Prototype 1'], creep);
			assert.deepEqual([CLAIM, WORK, MOVE, WORK, MOVE], creep.body);
		});
	});
	
	describe('#spawnCreep', () => {
		it('no creep', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 279;
			var object = new RolePrototype();
			
			var creep = object.spawnCreep(spawn);
			assert.equal(false, creep);
		});

		it('creep with 1 x parts', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 280;
			var object = new RolePrototype();
			
			var creep = object.spawnCreep(spawn);
			assert.equal(Game.creeps['Prototype 1'], creep);
			assert.deepEqual([WORK, CARRY, MOVE, MOVE], creep.body);
		});

		it('creep with 2 x parts', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 560;
			var object = new RolePrototype();
			
			var creep = object.spawnCreep(spawn);
			assert.equal(Game.creeps['Prototype 1'], creep);
			assert.deepEqual([WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE], creep.body);
		});
	});
	
	describe('#isNecessary', () => {
		it('target present', () => {
			var object = new RolePrototype();
			object._findTargets = room => [ 'target' ];
			
			assert.equal(true, object.isNecessary('room'));
		});

		it('no targets', () => {
			var object = new RolePrototype();
			object._findTargets = room => [];
			
			assert.equal(false, object.isNecessary('room'));
		});

		it('default', () => {
			var object = new RolePrototype();
			object._findTargets = room => [];
			
			assert.equal(false, object.isNecessary('room'));
		});
	});

	describe('#findTargets', () => {
		it('default', () => {
			var object = new RolePrototype();
			
			assert.deepEqual([], object._findTargets('room'));
		});
	});

	describe('#sortTargetForClosest', () => {
		it('multiple', () => {
			var object = new RolePrototype();

			var distances = [];
			distances['A'] = 4;
			distances['B'] = 1;
			distances['C'] = 10;
			
			var creep = new Creep('findClosestTarget');
			creep.pos = {};
			creep.pos.getRangeTo = target => distances[target];
			
			assert.deepEqual([ 'B', 'A', 'C' ], object._sortTargetForClosest([ 'A', 'B', 'C' ], creep));
		});
	});

	describe('#findClosestTarget', () => {
		it('default', () => {
			var object = new RolePrototype();

			var creep = new Creep('findClosestTarget > default');
			
			assert.equal(null, object._findClosestTarget(creep));
		});

		it('empty', () => {
			var object = new RolePrototype();
			object._findTargets = room => [];

			var creep = new Creep('findClosestTarget > empty');
			
			assert.equal(null, object._findClosestTarget(creep));
		});

		it('single', () => {
			var target = new Spawn();
			target.pos.x = 4;
			
			var object = new RolePrototype();
			object._findTargets = room => [ target ];

			var creep = new Creep('findClosestTarget > single');
			
			assert.equal(target, object._findClosestTarget(creep));
		});

		it('multiple', () => {
			var targetA = new Spawn();
			targetA.pos.x = 4;

			var targetB = new Spawn();
			targetB.pos.x = 1;

			var targetC = new Spawn();
			targetC.pos.x = 10;
			
			var object = new RolePrototype();
			object._findTargets = room => [ targetA, targetB, targetC ];

			var creep = new Creep('findClosestTarget > multiple');
			
			assert.equal(targetB, object._findClosestTarget(creep));
		});
	});

	describe('#moveToClosestTarget', () => {
		it('multiple', () => {
			var targetA = new Spawn();
			targetA.pos.x = 4;

			var targetB = new Spawn();
			targetB.pos.x = 1;

			var targetC = new Spawn();
			targetC.pos.x = 10;
			
			var object = new RolePrototype();
			object._findTargets = room => [ targetA, targetB, targetC ];

			var creep = new Creep('moveToClosestTarget');
			
			var workWasCalled = false;
			object._moveToClosestTarget(creep, target => {
				workWasCalled = true;
				assert.equal(targetB, target);
				return OK;
			});
			assert.equal(true, workWasCalled);
		});

		it('move to target if not in range', () => {
			var creep = new Creep('moveToLocation');
			var target = new Spawn();
			target.pos.x = 13;
			target.pos.y = 42;
			
			var object = new RolePrototype();
			object._findTargets = room => [ target ];

			var workWasCalled = false;
			object._moveToClosestTarget(creep, t => {
				workWasCalled = true;
				assert.equal(target, t);
				return ERR_NOT_IN_RANGE;
			});
			assert.equal(true, workWasCalled);
			assert.equal(13, creep.pos.x);
			assert.equal(42, creep.pos.y);
		});
		
		it('diverse error', () => {
			info.clearLines();
			var target = new Spawn();
			
			var object = new RolePrototype();
			object._findTargets = room => [ target ];

			var creep = new Creep('moveToClosestTarget');
			
			var workWasCalled = false;
			object._moveToClosestTarget(creep, t => {
				workWasCalled = true;
				assert.equal(target, t);
				return ERR_BUSY;
			});
			assert.equal(true, workWasCalled);
			assert.equal(1, info.getLines().length);
		});
	});

	describe('#moveToLocation', () => {
		it('default', () => {
			var creep = new Creep('moveToLocation');
			var target = new Spawn();
			target.pos.x = 13;
			target.pos.y = 42;
			
			var object = new RolePrototype();
			object._moveToLocation(creep, target);
			
			assert.equal(13, creep.pos.x);
			assert.equal(42, creep.pos.y);
		});
	});

	describe('#handleTargetWorkResult', () => {
		it('default', () => {
			var creep = new Creep('moveToClosestTarget');
			var target = new Spawn();
			target.pos.x = 13;
			target.pos.y = 42;
			
			var object = new RolePrototype();
			object._findTargets = room => [ target ];
			
			var workWasCalled = false; 
			object._handleTargetWorkResult = (workingCreep, result) => {
				workWasCalled = true;
				assert.equal(workingCreep, creep);
				assert.equal(result, 42);
				return ERR_BUSY;
			};

			object._moveToClosestTarget(creep, t => 42);
			assert.equal(true, workWasCalled);
		});
	});

	describe('#findSources', () => {
		it('default', () => {
			var room = new Room();
			
			var object = new RolePrototype();
			
			assert.deepEqual([], object._findSources(room));
		});
	});

	describe('#sortSourceForClosest', () => {
		it('multiple', () => {
			var room = new Room();
			
			var object = new RolePrototype();

			var distances = [];
			distances['A'] = 4;
			distances['B'] = 1;
			distances['C'] = 10;
			
			var creep = new Creep('findClosestSource');
			creep.pos = {};
			creep.pos.getRangeTo = source => distances[source];
			
			assert.deepEqual([ 'B', 'A', 'C' ], object._sortSourceForClosest([ 'A', 'B', 'C' ], creep));
		});
	});

	describe('#findClosestSource', () => {
		it('default', () => {
			var object = new RolePrototype();

			var creep = new Creep('findClosestSource > default');
			creep.room = new Room();
			
			assert.equal(null, object._findClosestSource(creep));
		});

		it('empty', () => {
			var object = new RolePrototype();
			object._findSources = room => [];

			var creep = new Creep('findClosestSource > empty');
			
			assert.equal(null, object._findClosestSource(creep));
		});

		it('single', () => {
			var source = new Spawn();
			source.pos.x = 4;
			
			var object = new RolePrototype();
			object._findSources = room => [ source ];

			var creep = new Creep('findClosestSource > single');
			
			assert.equal(source, object._findClosestSource(creep));
		});

		it('multiple', () => {
			var sourceA = new Spawn();
			sourceA.pos.x = 4;

			var sourceB = new Spawn();
			sourceB.pos.x = 1;

			var sourceC = new Spawn();
			sourceC.pos.x = 10;
			
			var object = new RolePrototype();
			object._findSources = room => [ sourceA, sourceB, sourceC ];

			var creep = new Creep('findClosestSource > multiple');
			
			assert.equal(sourceB, object._findClosestSource(creep));
		});
	});

	describe('#moveToClosestSource', () => {
		it('multiple', () => {
			var sourceA = new Spawn();
			sourceA.pos.x = 4;

			var sourceB = new Spawn();
			sourceB.pos.x = 1;

			var sourceC = new Spawn();
			sourceC.pos.x = 10;
			
			var object = new RolePrototype();
			object._findSources = room => [ sourceA, sourceB, sourceC ];

			var creep = new Creep('moveToClosestSource');
			creep.harvest = source => {
				workWasCalled = true;
				assert.equal(sourceB, source);
				return OK;
			};
			
			var workWasCalled = false;
			object._moveToClosestSource(creep);
			assert.equal(true, workWasCalled);
		});

		it('move to source if not in range', () => {
			var creep = new Creep('moveToLocation');
			var source = new Spawn();
			source.pos.x = 13;
			source.pos.y = 42;
			
			var object = new RolePrototype();
			object._findSources = room => [ source ];

			var workWasCalled = false;
			creep.harvest = t => {
				workWasCalled = true;
				assert.equal(source, t);
				return ERR_NOT_IN_RANGE;
			};
			
			object._moveToClosestSource(creep);
			assert.equal(true, workWasCalled);
			assert.equal(13, creep.pos.x);
			assert.equal(42, creep.pos.y);
		});
		
		it('diverse error', () => {
			info.clearLines();
			var source = new Spawn();
			
			var object = new RolePrototype();
			object._findSources = room => [ source ];

			var creep = new Creep('moveToClosestSource');
			
			var workWasCalled = false;
			creep.harvest = t => {
				workWasCalled = true;
				assert.equal(source, t);
				return ERR_BUSY;
			};
			
			object._moveToClosestSource(creep);
			assert.equal(true, workWasCalled);
			assert.equal(1, info.getLines().length);
		});
	});

	describe('#handleSourceWorkResult', () => {
		it('default', () => {
			var creep = new Creep('moveToClosestSource');
			creep.harvest = source => 42;
			
			var source = new Spawn();
			source.pos.x = 13;
			source.pos.y = 42;
			
			var object = new RolePrototype();
			object._findSources = room => [ source ];
			
			var workWasCalled = false; 
			object._handleSourceWorkResult = (workingCreep, result) => {
				workWasCalled = true;
				assert.equal(workingCreep, creep);
				assert.equal(result, 42);
				return ERR_BUSY;
			};

			object._moveToClosestSource(creep);
			assert.equal(true, workWasCalled);
		});
	});

	describe('#commuteBetweenSourceAndTarget', () => {
		it('lifecycle', () => {
			
			 // creep's energy is half full (capacity = 100);
			var creep = new Creep('moveToClosestSource', [CARRY, CARRY]);
			creep.store.usedCapacity = 50;
			creep.store[RESOURCE_ENERGY] = creep.store;
			
			var source = new Spawn();
			source.pos.x = 13;
			source.pos.y = 42;

			var target = new Spawn();
			target.pos.x = 23;
			target.pos.y = 6;
			
			var object = new RolePrototype();
			object._findSources = room => [ source ];
			object._findTargets = room => [ target ];
			
			// store is half full, so first travel to source
			object._commuteBetweenSourceAndTarget(creep, target => assert.fail('Creep should not work yet!'));

			assert.equal(50, creep.store[RESOURCE_ENERGY].getUsedCapacity());
			assert.equal(100, creep.store[RESOURCE_ENERGY].getCapacity());
			assert.equal(source.pos.x, creep.pos.x);
			assert.equal(source.pos.y, creep.pos.y);

			// store is still half full, so harvest source
			object._commuteBetweenSourceAndTarget(creep, target => assert.fail('Creep should not work yet!'));

			assert.equal(100, creep.store[RESOURCE_ENERGY].getUsedCapacity());
			assert.equal(100, creep.store[RESOURCE_ENERGY].getCapacity());
			assert.equal(source.pos.x, creep.pos.x);
			assert.equal(source.pos.y, creep.pos.y);

			// store is full, target is out of range, so move to target
			object._commuteBetweenSourceAndTarget(creep, target => creep.transfer(target, RESOURCE_ENERGY));

			assert.equal(100, creep.store[RESOURCE_ENERGY].getUsedCapacity());
			assert.equal(100, creep.store[RESOURCE_ENERGY].getCapacity());
			assert.equal(target.pos.x, creep.pos.x);
			assert.equal(target.pos.y, creep.pos.y);

			// store is full, target is in range, so work
			object._commuteBetweenSourceAndTarget(creep, target => creep.transfer(target, RESOURCE_ENERGY));

			assert.equal(null, creep.store[RESOURCE_ENERGY]);
			assert.equal(0, creep.store.getUsedCapacity());
			assert.equal(100, creep.store.getCapacity());
			assert.equal(target.pos.x, creep.pos.x);
			assert.equal(target.pos.y, creep.pos.y);

			// 2) store is empty, so first travel to source
			object._commuteBetweenSourceAndTarget(creep, target => assert.fail('Creep should not work anymore!'));

			assert.equal(null, creep.store[RESOURCE_ENERGY]);
			assert.equal(0, creep.store.getUsedCapacity());
			assert.equal(100, creep.store.getCapacity());
			assert.equal(source.pos.x, creep.pos.x);
			assert.equal(source.pos.y, creep.pos.y);
		});
	});

	describe('#work', () => {
		it('default', () => {
			var creep = new Creep('run');
			
			var workWasCalled = false; 
			creep.say = (line) => {
				workWasCalled = true;
				assert.equal('🛑 unimplemented 🛑', line);
			};

			var object = new RolePrototype();
			object._work(creep);

			assert.equal(true, workWasCalled);
		});
	});
	
	describe('#run', () => {
		it('default', () => {
			var creep = new Creep('run');

			var object = new RolePrototype();
			
			var workWasCalled = false; 
			object._work = (workingCreep) => {
				workWasCalled = true;
				assert.equal(workingCreep, creep);
			};

			object.run(creep);
			assert.equal(true, workWasCalled);
		});

		it('self-destruct', () => {
			info.clearLines();
			
			var creep = new Creep('run');
			creep.memory.selfdestruct = true;

			var spawn = new Spawn();
			spawn.pos.x = 13;
			spawn.pos.y = 42;
			creep.pos.findClosestByPath = type => spawn;
			
			var object = new RolePrototype();
			
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

			var droppedEnergy = { 
				pos: new RoomPosition(),
			};
			droppedEnergy.resourceType = RESOURCE_ENERGY;
			droppedEnergy.pos.x = 12;
			droppedEnergy.pos.y = 13;
			
			var creep = new Creep('run');
			creep.store = new Store(100);
			creep.pos.findInRange = (type) => (type == FIND_DROPPED_RESOURCES) ? [ droppedEnergy ] : [];
			
			var object = new RolePrototype();
			
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
			info.clearLines();

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
			
			var object = new RolePrototype();
			
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
	});

	describe('#selfdestruct', () => {
		it('no spawn', () => {
			info.clearLines();
			
			var creep = new Creep('run');
			creep.memory.selfdestruct = true;
			
			var object = new RolePrototype();
			
			// no spawn found, so print error message and return
			creep.pos.findClosestByPath = type => null;
			object._selfdestruct(creep);

			assert.equal(1, info.getLines().length);
		});

		it('lifecycle', () => {
			info.clearLines();
			
			var creep = new Creep('selfdestruct');
			creep.memory.selfdestruct = true;

			var spawn = new Spawn();
			spawn.pos.x = 13;
			spawn.pos.y = 42;
			creep.pos.findClosestByPath = type => spawn;
			
			var object = new RolePrototype();
			
			// spawn is far away, so go there
			object._selfdestruct(creep);

			assert.equal(spawn.pos.x, creep.pos.x);
			assert.equal(spawn.pos.y, creep.pos.y);
			assert.equal(creep, Game.creeps['selfdestruct']);

			// spawn is now close, so self-destruct
			object._selfdestruct(creep);

			assert.equal(spawn.pos.x, creep.pos.x);
			assert.equal(spawn.pos.y, creep.pos.y);
			assert.equal(null, Game.creeps['selfdestruct']);
		});
	});

	describe('TARGET_MODE_X', () => {
		var setupRolePrototype = function(targetMode) {
			
			assert.notEqual(null, targetMode);
			
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
			
			var object = new RolePrototype();
			object._targetMode = targetMode;
			object._findTargets = room => [ targetA, targetB, targetC ];

			assert.equal(targetB, object._findClosestTarget(new Creep('TARGET_MODE_X')));
			return object;
		}
		
		describe('USE_IF_VALID', () => {
			describe('#findClosestTarget', () => {
				it('target found', () => {
					var creep = new Creep('TARGET_MODE_USE_IF_VALID');
					creep.memory.target = 'C';

					var object = setupRolePrototype(RolePrototype.TARGET_MODE_USE_IF_VALID);
					
					assert.equal('C', object._findClosestTarget(creep).id);
					assert.equal(0, info.getLines().length);
				});

				it('target not valid', () => {
					// if it was not found in "findTargets()", the target is not valid -> use other
					var creep = new Creep('TARGET_MODE_USE_IF_VALID');
					creep.memory.target = 'D';

					var object = setupRolePrototype(RolePrototype.TARGET_MODE_USE_IF_VALID);
					
					assert.equal('B', object._findClosestTarget(creep).id);
					assert.equal(0, info.getLines().length);
				});
				
				it('target not found', () => {
					// target is not even a game object -> error and use other
					var creep = new Creep('TARGET_MODE_USE_IF_VALID');
					creep.memory.target = 'E';

					var object = setupRolePrototype(RolePrototype.TARGET_MODE_USE_IF_VALID);
					
					assert.equal('B', object._findClosestTarget(creep).id);
					assert.equal(1, info.getLines().length);
					assert.equal('🛑 TARGET_MODE_USE_IF_VALID could not find target: E', info.getLine(0));
				});
			});
		});
		
		describe('USE_OR_WAIT', () => {
			describe('#findClosestTarget', () => {
				it('target found', () => {
					var creep = new Creep('TARGET_MODE_USE_OR_WAIT');
					creep.memory.target = 'C';

					var object = setupRolePrototype(RolePrototype.TARGET_MODE_USE_OR_WAIT);
					
					assert.equal('C', object._findClosestTarget(creep).id);
					assert.equal(0, info.getLines().length);
				});
				
				it('target not valid', () => {
					// if it was not found in "findTargets()", the target is not valid -> use anyway
					var creep = new Creep('TARGET_MODE_USE_OR_WAIT');
					creep.memory.target = 'D';

					var object = setupRolePrototype(RolePrototype.TARGET_MODE_USE_OR_WAIT);
					
					assert.equal('D', object._findClosestTarget(creep).id);
					assert.equal(0, info.getLines().length);
				});

				it('target not found', () => {
					// target is not even a game object -> error and wait
					var creep = new Creep('TARGET_MODE_USE_OR_WAIT');
					creep.memory.target = 'E';

					var object = setupRolePrototype(RolePrototype.TARGET_MODE_USE_OR_WAIT);
					
					assert.equal(null, object._findClosestTarget(creep));
					assert.equal(1, info.getLines().length);
					assert.equal('🛑 TARGET_MODE_USE_OR_WAIT could not find target: E', info.getLine(0));
				});
			});
		});

		describe('USE_OR_ERROR', () => {
			describe('#findClosestTarget', () => {
				it('target found', () => {
					var creep = new Creep('TARGET_MODE_USE_OR_ERROR');
					creep.memory.target = 'C';

					var object = setupRolePrototype(RolePrototype.TARGET_MODE_USE_OR_ERROR);
					
					assert.equal('C', object._findClosestTarget(creep).id);
					assert.equal(0, info.getLines().length);
				});
				
				it('target not valid', () => {
					// if it was not found in "findTargets()", the target is not valid -> error
					var creep = new Creep('TARGET_MODE_USE_OR_ERROR');
					creep.memory.target = 'D';

					var object = setupRolePrototype(RolePrototype.TARGET_MODE_USE_OR_ERROR);
					
					assert.equal(null, object._findClosestTarget(creep));	
					assert.equal(1, info.getLines().length);
					assert.equal('🛑 TARGET_MODE_USE_OR_ERROR could not find target in list: D', info.getLine(0));
				});
				
				it('target not found', () => {
					// target is not even a game object -> error
					var creep = new Creep('TARGET_MODE_USE_OR_ERROR');
					creep.memory.target = 'E';

					var object = setupRolePrototype(RolePrototype.TARGET_MODE_USE_OR_ERROR);
					
					assert.equal(null, object._findClosestTarget(creep));	
					assert.equal(1, info.getLines().length);
					assert.equal('🛑 TARGET_MODE_USE_OR_ERROR could not find target: E', info.getLine(0));
				});
			});
		});
	});

	describe('SOURCE_MODE_X', () => {
		var setupRolePrototype = function(sourceMode) {
			
			assert.notEqual(null, sourceMode);
			
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
			
			var object = new RolePrototype();
			object._sourceMode = sourceMode;
			object._findSources = room => [ sourceA, sourceB, sourceC ];

			assert.equal(sourceB, object._findClosestSource(new Creep('SOURCE_MODE_X')));
			return object;
		}
		
		describe('USE_IF_VALID', () => {
			describe('#findClosestSource', () => {
				it('source found', () => {
					var creep = new Creep('SOURCE_MODE_USE_IF_VALID');
					creep.memory.source = 'C';

					var object = setupRolePrototype(RolePrototype.SOURCE_MODE_USE_IF_VALID);
					
					assert.equal('C', object._findClosestSource(creep).id);
					assert.equal(0, info.getLines().length);
				});

				it('source not valid', () => {
					// if it was not found in "findSources()", the source is not valid -> use other
					var creep = new Creep('SOURCE_MODE_USE_IF_VALID');
					creep.memory.source = 'D';

					var object = setupRolePrototype(RolePrototype.SOURCE_MODE_USE_IF_VALID);
					
					assert.equal('B', object._findClosestSource(creep).id);
					assert.equal(0, info.getLines().length);
				});
				
				it('source not found', () => {
					// source is not even a game object -> error and use other
					var creep = new Creep('SOURCE_MODE_USE_IF_VALID');
					creep.memory.source = 'E';

					var object = setupRolePrototype(RolePrototype.SOURCE_MODE_USE_IF_VALID);
					
					assert.equal('B', object._findClosestSource(creep).id);
					assert.equal(1, info.getLines().length);
					assert.equal('🛑 SOURCE_MODE_USE_IF_VALID could not find source: E', info.getLine(0));
				});
			});
		});
		
		describe('USE_OR_WAIT', () => {
			describe('#findClosestSource', () => {
				it('source found', () => {
					var creep = new Creep('SOURCE_MODE_USE_OR_WAIT');
					creep.memory.source = 'C';

					var object = setupRolePrototype(RolePrototype.SOURCE_MODE_USE_OR_WAIT);
					
					assert.equal('C', object._findClosestSource(creep).id);
					assert.equal(0, info.getLines().length);
				});
				
				it('source not valid', () => {
					// if it was not found in "findSources()", the source is not valid -> use anyway
					var creep = new Creep('SOURCE_MODE_USE_OR_WAIT');
					creep.memory.source = 'D';

					var object = setupRolePrototype(RolePrototype.SOURCE_MODE_USE_OR_WAIT);
					
					assert.equal('D', object._findClosestSource(creep).id);
					assert.equal(0, info.getLines().length);
				});

				it('source not found', () => {
					// source is not even a game object -> error and wait
					var creep = new Creep('SOURCE_MODE_USE_OR_WAIT');
					creep.memory.source = 'E';

					var object = setupRolePrototype(RolePrototype.SOURCE_MODE_USE_OR_WAIT);
					
					assert.equal(null, object._findClosestSource(creep));
					assert.equal(1, info.getLines().length);
					assert.equal('🛑 SOURCE_MODE_USE_OR_WAIT could not find source: E', info.getLine(0));
				});
			});
		});

		describe('USE_OR_ERROR', () => {
			describe('#findClosestSource', () => {
				it('source found', () => {
					var creep = new Creep('SOURCE_MODE_USE_OR_ERROR');
					creep.memory.source = 'C';

					var object = setupRolePrototype(RolePrototype.SOURCE_MODE_USE_OR_ERROR);
					
					assert.equal('C', object._findClosestSource(creep).id);
					assert.equal(0, info.getLines().length);
				});
				
				it('source not valid', () => {
					// if it was not found in "findSources()", the source is not valid -> error
					var creep = new Creep('SOURCE_MODE_USE_OR_ERROR');
					creep.memory.source = 'D';

					var object = setupRolePrototype(RolePrototype.SOURCE_MODE_USE_OR_ERROR);
					
					assert.equal(null, object._findClosestSource(creep));	
					assert.equal(1, info.getLines().length);
					assert.equal('🛑 SOURCE_MODE_USE_OR_ERROR could not find source in list: D', info.getLine(0));
				});
				
				it('source not found', () => {
					// source is not even a game object -> error
					var creep = new Creep('SOURCE_MODE_USE_OR_ERROR');
					creep.memory.source = 'E';

					var object = setupRolePrototype(RolePrototype.SOURCE_MODE_USE_OR_ERROR);
					
					assert.equal(null, object._findClosestSource(creep));	
					assert.equal(1, info.getLines().length);
					assert.equal('🛑 SOURCE_MODE_USE_OR_ERROR could not find source: E', info.getLine(0));
				});
			});
		});
	});
});
