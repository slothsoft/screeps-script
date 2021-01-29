var Explorer = require('../src/role.explorer');
var assert = require('assert');

var constants = require('../src/main.constants');
var info = require('../src/main.info');
var MainUtil = require('../src/main.util');

var Creep = require('./mock/creep-mock');
var Room = require('./mock/room-mock');
var RoomPosition = require('./mock/room-position-mock');
var Spawn = require('./mock/spawn-mock');
var Store = require('./mock/store-mock');

// TODO: Test other methods
// - createSpawn
// - claimFlagRoom
// - buildSpaw
// - retire

const PHASE_GOTO_FLAG_ROOM = 'gotoFlagRoom';
const PHASE_CLAIM_FLAG_ROOM = 'claimFlagRoom';

describe('role.explorer', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	});

	beforeEach(() => {
		Game.clearAll();
		info.clearLines();
	});
	
	it('exists', () => {
		var startsWith = 'class Explorer';
		assert.equal(startsWith, Explorer.toString().substring(0, startsWith.length));
		
		var object = new Explorer();
		assert.equal('Explorer', object.roleName);
		assert.equal('#cccccc', object.color);
		assert.equal('🏴', object.symbol);
		assert.equal(0, object.priority);
	});

	describe('#findTargets', () => {
		it('find correct structures', () => {

			var flag = new Spawn();
			flag.name = 'My Flag';
			
			MainUtil.findAllFlags = () => [ flag ];

			var object = new Explorer();
			assert.deepEqual([ flag ], object._findTargets(flag.room));
		});
	});
	
	describe('#spawnCreepFromSpawn', () => {
		it('no spawn', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 50;
			
			var object = new Explorer();
			
			var creep = object._spawnCreepFromSpawn(spawn, 'Flag');
			assert.equal(false, creep);
		});
		
		it('spawn', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 930;
			
			var object = new Explorer();
			
			var creep = object._spawnCreepFromSpawn(spawn, 'Flag');
			assert.notEqual(false, creep);
			assert.equal('Flag', creep.memory.target);
			assert.equal(Game.creeps['Explorer 1'], creep);
			assert.deepEqual([ CLAIM, MOVE, WORK, MOVE, CARRY, MOVE ], creep.body);
		});

		it('no flag', () => {
			info.clearLines();
			
			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 1210;
			
			var object = new Explorer();
			
			var creep = object._spawnCreepFromSpawn(spawn);
			assert.notEqual(false, creep);
			assert.equal(undefined, creep.memory.target);
			assert.equal(Game.creeps['Explorer 1'], creep);
			assert.deepEqual([ CLAIM, MOVE, WORK, MOVE, CARRY, MOVE, WORK, MOVE, CARRY, MOVE ], creep.body);
		});
	});

	describe('#spawnCreepFromSpawnName', () => {
		it('no spawn', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 50;
			
			var object = new Explorer();
			
			var creep = object.spawnCreepFromSpawnName(spawn.name, 'Flag');
			assert.equal(false, creep);
		});
		
		it('spawn', () => {
			info.clearLines();

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 930;
			
			var object = new Explorer();
			
			var creep = object.spawnCreepFromSpawnName(spawn.name, 'Flag');
			assert.notEqual(false, creep);
			assert.equal('Flag', creep.memory.target);
			assert.equal(Game.creeps['Explorer 1'], creep);
			assert.deepEqual([ CLAIM, MOVE, WORK, MOVE, CARRY, MOVE ], creep.body);

			assert.equal(1, info.getLines().length);
			assert.equal('🏴 Spawning new Explorer (6p)', info.getLine(0));
		});

		it('no flag', () => {
			info.clearLines();
			
			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 1210;
			
			var object = new Explorer();
			
			var creep = object.spawnCreepFromSpawnName(spawn.name);
			assert.notEqual(false, creep);
			assert.equal(undefined, creep.memory.target);
			assert.equal(Game.creeps['Explorer 1'], creep);
			assert.deepEqual([ CLAIM, MOVE, WORK, MOVE, CARRY, MOVE, WORK, MOVE, CARRY, MOVE ], creep.body);
		});

		it('no spawn found', () => {
			info.clearLines();
			
			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 77;
			
			var object = new Explorer();
			
			var creep = object.spawnCreepFromSpawnName('ABC', 'Flag');
			assert.equal(false, creep);
			
			assert.equal(1, info.getLines().length);
			assert.equal('🛑 Could not find spawn: ABC', info.getLine(0));
		});
	});

	describe('#spawnCreep', () => {
		it('find correct flag', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 50;

			var flag = new Spawn();
			flag.name = 'Flag Name';
			MainUtil.findAllFlags = () => [ flag ];
			
			var object = new Explorer();
			
			var spawnWasCalled = false;
			object._spawnCreepFromSpawn = (usedSpawn, flagName) => {
				assert.deepEqual(spawn, usedSpawn);
				assert.deepEqual(flag.name, flagName);
				spawnWasCalled = true;
			};
			
			object.spawnCreep(spawn);
			assert.equal(true, spawnWasCalled);
		});

		it('no flag found', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 50;
			MainUtil.findAllFlags = () => [ ];
			
			var object = new Explorer();
			
			var spawnWasCalled = false;
			object.spawnCreepFromSpawn = (usedSpawn, flagName) => {
				spawnWasCalled = true;
			};
			
			var creep = object.spawnCreep(spawn);
			assert.equal(false, creep);
			assert.equal(false, spawnWasCalled);
		});
	});

	describe('#work (via run)', () => {
		it('self-destruct', () => {
			info.clearLines();
			
			var creep = new Creep('run');
			creep.memory.selfdestruct = true;

			var spawn = new Spawn();
			spawn.pos.x = 13;
			spawn.pos.y = 42;
			creep.pos.findClosestByPath = type => spawn;
			
			var object = new Explorer();
			
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
			
			var object = new Explorer();
			
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
			
			var object = new Explorer();
			
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
			
			var object = new Explorer();
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

	describe('#goToFlagRoom', () => {
		var test = function(work) {
			var creep = new Creep();
			creep.name = 'CreepX';
			creep.room.controller = {};

			var flag1 = {
				id: 'flag-id-1',
				name: 'Flag Name 1',
				pos: new RoomPosition(),
			};
			flag1.pos.x = 1;
			flag1.pos.y = 2;

			var flag2 = {
				id: 'flag-id-2',
				name: 'Flag Name 2',
				pos: new RoomPosition(),
			};
			flag2.pos.x = 3;
			flag2.pos.y = 4;
			
			var object = new Explorer();

			assert.equal(null, creep.memory.target);
			
			// first time this is called find flag and store it in memory 
			MainUtil.findAllFlags = () => [ flag1, flag2 ];
			
			work(object, creep);
			
			assert.equal('Flag Name 1', creep.memory.target);
			assert.equal(1, creep.pos.x);
			assert.equal(2, creep.pos.y);
			assert.equal(1, info.getLines().length);
			assert.equal('🏴 CreepX travels to Flag Name 1', info.getLine(0));

			// second time this is called find flag and store it in memory 
			info.clearLines();
			creep.memory.target = 'Flag Name 2';
			
			work(object, creep);
			
			assert.equal('Flag Name 2', creep.memory.target);
			assert.equal(3, creep.pos.x);
			assert.equal(4, creep.pos.y);
			assert.equal(0, info.getLines().length);
			
			// third time the creep is in the same room, so switch phases
			flag2.pos.x = 5;
			flag2.pos.y = 6;
			flag2.room = creep.room;

			work(object, creep);

			assert.equal('Flag Name 2', creep.memory.target);
			assert.equal(5, creep.pos.x);
			assert.equal(6, creep.pos.y);
			assert.equal(1, info.getLines().length);
			assert.equal('🏴 CreepX claims the room of Flag Name 2', info.getLine(0));
			assert.equal('claimFlagRoom', creep.memory.phase);
		};
		it('function', () => {
			test((explorer, creep) => explorer._goToFlagRoom(creep));
		});
		it('with #work', () => {
			test((explorer, creep) => explorer._work(creep));
		});
	});
	
	describe('#claimFlagRoom', () => {
		var test = function(work) {
			var creep = new Creep();

		};
		it('function', () => {
			test((explorer, creep) => explorer._goToFlagRoom(creep));
		});
		it('with #work', () => {
			test((explorer, creep) => explorer._work(creep));
		});
	});

	describe('TARGET_MODE_USE_OR_ERROR', () => {
		var setupExplorer = function() {
			
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
			
			var object = new Explorer();
			object._findTargets = room => [ targetA, targetB, targetC ];

			assert.equal(targetB, object._findClosestTarget(new Creep('TARGET_MODE_X')));
			return object;
		}

		describe('#findClosestTarget', () => {
			it('target found', () => {
				var creep = new Creep('Explorer');
				creep.memory.target = 'C';

				var object = setupExplorer();
				
				assert.equal('C', object._findClosestTarget(creep).id);
				assert.equal(0, info.getLines().length);
			});
			
			it('target not valid', () => {
				// if it was not found in "findTargets()", the target is not valid -> error
				var creep = new Creep('Explorer');
				creep.memory.target = 'D';

				var object = setupExplorer();
				
				assert.equal(null, object._findClosestTarget(creep));	
				assert.equal(1, info.getLines().length);
				assert.equal('🛑 Explorer could not find target in list: D', info.getLine(0));
			});
			
			it('target not found', () => {
				// target is not even a game object -> error
				var creep = new Creep('Explorer');
				creep.memory.target = 'E';

				var object = setupExplorer();
				
				assert.equal(null, object._findClosestTarget(creep));	
				assert.equal(1, info.getLines().length);
				assert.equal('🛑 Explorer could not find target: E', info.getLine(0));
			});
		});
	});

	describe('SOURCE_MODE_USE_OR_WAIT', () => {
		var setupExplorer = function() {
			
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
			
			var object = new Explorer();
			object._findSources = room => [ sourceA, sourceB, sourceC ];

			assert.equal(sourceB, object._findClosestSource(new Creep('SOURCE_MODE_X')));
			return object;
		}
		
		describe('#findClosestSource', () => {
			it('source found', () => {
				var creep = new Creep('Explorer');
				creep.memory.source = 'C';

				var object = setupExplorer();
				
				assert.equal('C', object._findClosestSource(creep).id);
				assert.equal(0, info.getLines().length, info.getLines().toString());
			});
			
			it('source not valid', () => {
				// if it was not found in "findSources()", the source is not valid -> use anyway
				var creep = new Creep('Explorer');
				creep.memory.source = 'D';

				var object = setupExplorer();
				
				assert.equal('D', object._findClosestSource(creep).id);
				assert.equal(0, info.getLines().length, info.getLines().toString());
			});

			it('source not found', () => {
				// source is not even a game object -> error and wait
				var creep = new Creep('Explorer');
				creep.memory.source = 'E';

				var object = setupExplorer();
				
				assert.equal(null, object._findClosestSource(creep));
				assert.equal(1, info.getLines().length);
				assert.equal('🛑 Explorer could not find source: E', info.getLine(0));
			});
		});
	});
});
