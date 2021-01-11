var Prototype = require('../src/role.prototype');
var assert = require('assert');

require('./mock/creep-mock');
require('./mock/game-mock');
var Spawn = require('./mock/spawn-mock');

describe('role.protoype', () => {
	it('exists', () => {
		var startsWith = 'class Prototype';
		assert.equal(startsWith, Prototype.toString().substring(0, startsWith.length));
	});

	describe('#constructor', () => {
		it('noArgs', () => {
			var object = new Prototype();

			assert.equal('XXX', object.roleName);
			assert.equal(0, object.requiredNumber);
			assert.equal('#ff0000', object.color);
			assert.equal('❗', object.symbol);
		});

		it('args', () => {
			var object = new Prototype('Role', 42, 'green', '🎗');

			assert.equal('Role', object.roleName);
			assert.equal(42, object.requiredNumber);
			assert.equal('green', object.color);
			assert.equal('🎗', object.symbol);
		});
	});

	describe('#calculateCostsForSinglePart', () => {
		it('MOVE', () => {
			var object = new Prototype();
			assert.equal('50', object.calculateCostsForSinglePart(MOVE));
		});

		it('WORK', () => {
			var object = new Prototype();
			assert.equal('100', object.calculateCostsForSinglePart(WORK));
		});
	});

	describe('#calculateCostsForParts', () => {
		it('empty', () => {
			var object = new Prototype();
			assert.equal('0', object.calculateCostsForParts([]));
		});

		it('WORK', () => {
			var object = new Prototype();
			assert.equal('100', object.calculateCostsForParts([WORK]));
		});

		it('MOVE, WORK', () => {
			var object = new Prototype();
			assert.equal('150', object.calculateCostsForParts([WORK, MOVE]));
		});
	});

	describe('#getPartsMinMultiplier', () => {
		it('default', () => {
			var object = new Prototype();
			
			assert.equal(0, object.getPartsMinMultiplier(new Spawn()));
		});

		it('set', () => {
			var spawn = new Spawn();
			spawn.room.memory.base = { partsMinMultiplier : 2 };
			
			var object = new Prototype();
			
			assert.equal(2, object.getPartsMinMultiplier(spawn));
		});
	});

	describe('#getPartsMaxMultiplier', () => {
		it('default', () => {
			var object = new Prototype();
			
			assert.equal(20, object.getPartsMaxMultiplier(new Spawn()));
		});

		it('set', () => {
			var spawn = new Spawn();
			spawn.room.memory.base = { partsMaxMultiplier : 7 };
			
			var object = new Prototype();
			
			assert.equal(7, object.getPartsMaxMultiplier(spawn));
		});
	});
	
	describe('#replicateParts', () => {
		it('0 parts x 0', () => {
			var object = new Prototype();
			
			assert.deepEqual([], object.replicateParts([], 0));
		});
		
		it('1 parts x 0', () => {
			var object = new Prototype();
			
			assert.deepEqual([], object.replicateParts([MOVE], 0));
		});

		it('2 parts x 0', () => {
			var object = new Prototype();
			
			assert.deepEqual([], object.replicateParts([MOVE, WORK], 0));
		});

		it('0 parts x 1', () => {
			var object = new Prototype();
			
			assert.deepEqual([], object.replicateParts([], 1));
		});
		
		it('1 parts x 1', () => {
			var object = new Prototype();
			
			assert.deepEqual([MOVE], object.replicateParts([MOVE], 1));
		});

		it('2 parts x 1', () => {
			var object = new Prototype();
			
			assert.deepEqual([MOVE, WORK], object.replicateParts([MOVE, WORK], 1));
		});

		it('0 parts x 2', () => {
			var object = new Prototype();
			
			assert.deepEqual([], object.replicateParts([], 2));
		});
		
		it('1 parts x 2', () => {
			var object = new Prototype();
			
			assert.deepEqual([MOVE, MOVE], object.replicateParts([MOVE], 2));
		});

		it('2 parts x 2', () => {
			var object = new Prototype();
			
			assert.deepEqual([MOVE, WORK, MOVE, WORK], object.replicateParts([MOVE, WORK], 2));
		});
	});

	describe('#calculateMaxParts', () => {
		it('0 parts 0 single => 0', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 0;
			
			var object = new Prototype();
			
			assert.equal(null, object.calculateMaxParts(spawn, []));
		});

		it('1 parts 0 single => 0', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 0;
			
			var object = new Prototype();
			
			assert.equal(null, object.calculateMaxParts(spawn, [MOVE]));
		});

		it('1 parts 0 single => 1', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 50;
			
			var object = new Prototype();
			
			assert.deepEqual([MOVE], object.calculateMaxParts(spawn, [MOVE]));
		});

		it('1 parts 0 single => 2', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 100;
			
			var object = new Prototype();
			
			assert.deepEqual([MOVE, MOVE], object.calculateMaxParts(spawn, [MOVE]));
		});

		it('2 parts 0 single => 0', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 50;
			
			var object = new Prototype();
			
			assert.equal(null, object.calculateMaxParts(spawn, [MOVE, MOVE]));
		});

		it('2 parts 0 single => 1', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 110;
			
			var object = new Prototype();
			
			assert.deepEqual([MOVE, MOVE], object.calculateMaxParts(spawn, [MOVE, MOVE]));
		});

		it('2 parts 0 single => 2', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 299;
			
			var object = new Prototype();
			
			assert.deepEqual([MOVE, MOVE, MOVE, MOVE], object.calculateMaxParts(spawn, [MOVE, MOVE]));
		});

		it('0 parts 1 single => 0', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 0;
			
			var object = new Prototype();
			
			assert.equal(null, object.calculateMaxParts(spawn, [], [WORK]));
		});

		it('1 parts 1 single => 0', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 0;
			
			var object = new Prototype();
			
			assert.equal(null, object.calculateMaxParts(spawn, [MOVE], [ATTACK]));
		});

		it('1 parts 1 single => 1', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 100;
			
			var object = new Prototype();
			
			assert.deepEqual([ATTACK, MOVE], object.calculateMaxParts(spawn, [MOVE], [ATTACK]));
		});

		it('1 parts 1 single => 2', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 150;
			
			var object = new Prototype();
			
			assert.deepEqual([ATTACK, MOVE, MOVE], object.calculateMaxParts(spawn, [MOVE], [ATTACK]));
		});

		it('2 parts 1 single => 0', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 149;
			
			var object = new Prototype();
			
			assert.equal(null, object.calculateMaxParts(spawn, [MOVE, MOVE], [ATTACK]));
		});

		it('2 parts 1 single => 1', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 150;
			
			var object = new Prototype();
			
			assert.deepEqual([ATTACK, MOVE, MOVE], object.calculateMaxParts(spawn, [MOVE, MOVE], [ATTACK]));
		});

		it('2 parts 1 single => 2', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 299;
			
			var object = new Prototype();
			
			assert.deepEqual([ATTACK, MOVE, MOVE, MOVE, MOVE], object.calculateMaxParts(spawn, [MOVE, MOVE], [ATTACK]));
		});

		it('1 parts 2 single => 2', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 250;
			
			var object = new Prototype();
			
			assert.deepEqual([ATTACK, WORK, MOVE, MOVE], object.calculateMaxParts(spawn, [MOVE], [ATTACK, WORK]));
		});

		it('2 parts 2 single => 0', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 249;
			
			var object = new Prototype();
			
			assert.equal(null, object.calculateMaxParts(spawn, [MOVE, MOVE], [ATTACK, WORK]));
		});

		it('2 parts 2 single => 1', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 250;
			
			var object = new Prototype();
			
			assert.deepEqual([ATTACK, WORK, MOVE, MOVE], object.calculateMaxParts(spawn, [MOVE, MOVE], [ATTACK, WORK]));
		});

		it('2 parts 2 single => 2', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 399;
			
			var object = new Prototype();
			
			assert.deepEqual([ATTACK, WORK, MOVE, MOVE, MOVE, MOVE], object.calculateMaxParts(spawn, [MOVE, MOVE], [ATTACK, WORK]));
		});
	});

	describe('#spawnCreepWithParts', () => {
		it('default => no creep', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 50;
			var object = new Prototype();
			
			var creep = object.spawnCreepWithParts(spawn, [WORK, MOVE]);
			assert.equal(false, creep);
		});

		it('default => creep with 1 x parts', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 150;
			spawn.spawnCreep([WORK, MOVE])
			var object = new Prototype();
			
			var creep = object.spawnCreepWithParts(spawn, [WORK, MOVE]);
			assert.equal(Game.creeps['XXX 1'], creep);
		});
	});

});


//spawnCreep()
//isNecessary()
//findTargets()
//findClosestTarget()
//sortTargetForClosest()
//moveToClosestTarget()
//moveToLocation()
//moveToSource()
//run()
//work()
//commuteBetweenSourceAndTarget()
