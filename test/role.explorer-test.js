var Explorer = require('../src/role.explorer');
var assert = require('assert');

var constants = require('../src/main.constants');
var info = require('../src/main.info');
var game = require('../src/main.game');

var Creep = require('./mock/creep-mock');
var Room = require('./mock/room-mock.js');
var RoomPosition = require('./mock/room-position-mock.js');
var Spawn = require('./mock/spawn-mock');
var Store = require('./mock/store-mock');

// Almost all methods tested.
// TODO: test #claimFlagRoom

const PHASE_GOTO_FLAG_ROOM = 'gotoFlagRoom';
const PHASE_CLAIM_FLAG_ROOM = 'claimFlagRoom';

describe('role.explorer', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	});

	beforeEach(() => {
		Game.clearAll();
		info.clearLog();
	});
	
	it('exists', () => {
		var startsWith = 'class Explorer';
		assert.equal(startsWith, Explorer.toString().substring(0, startsWith.length));
		
		var object = new Explorer();
		assert.equal('Explorer', object.roleName);
		assert.equal('#cccccc', object.color);
		assert.equal('🏴', object.symbol);
		assert.equal(0, object.priority);

		assert.equal(constants.SOURCE_USE_SOURCE, object.useStorageAsSource);
		assert.equal(constants.SOURCE_USE_STORAGE, object.useSourceAsSource);
	});

	describe('#findTargets', () => {
		it('find correct structures', () => {

			var flag = new Spawn();
			flag.name = 'My Flag';
			
			game.findAllFlags = () => [ flag ];

			var object = new Explorer();
			assert.deepEqual([ flag ], object.findTargets(flag.room));
		});
	});
	
	describe('#spawnCreepFromSpawn', () => {
		it('no spawn', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 50;
			
			var object = new Explorer();
			
			var creep = object.spawnCreepFromSpawn(spawn, 'Flag');
			assert.equal(false, creep);
		});
		
		it('spawn', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 930;
			
			var object = new Explorer();
			
			var creep = object.spawnCreepFromSpawn(spawn, 'Flag');
			assert.notEqual(false, creep);
			assert.equal('Flag', creep.memory.targetFlag);
			assert.equal(Game.creeps['Explorer 1'], creep);
			assert.deepEqual([ CLAIM, MOVE, WORK, MOVE, CARRY, MOVE ], creep.body);
		});

		it('no flag', () => {
			info.clearLog();
			
			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 1210;
			
			var object = new Explorer();
			
			var creep = object.spawnCreepFromSpawn(spawn);
			assert.notEqual(false, creep);
			assert.equal(undefined, creep.memory.targetFlag);
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
			info.clearLog();

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 930;
			
			var object = new Explorer();
			
			var creep = object.spawnCreepFromSpawnName(spawn.name, 'Flag');
			assert.notEqual(false, creep);
			assert.equal('Flag', creep.memory.targetFlag);
			assert.equal(Game.creeps['Explorer 1'], creep);
			assert.deepEqual([ CLAIM, MOVE, WORK, MOVE, CARRY, MOVE ], creep.body);

			assert.equal(1, info.console.length);
			assert.equal('🏴 Spawning new Explorer (6p)', info.console[0]);
		});

		it('no flag', () => {
			info.clearLog();
			
			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 1210;
			
			var object = new Explorer();
			
			var creep = object.spawnCreepFromSpawnName(spawn.name);
			assert.notEqual(false, creep);
			assert.equal(undefined, creep.memory.targetFlag);
			assert.equal(Game.creeps['Explorer 1'], creep);
			assert.deepEqual([ CLAIM, MOVE, WORK, MOVE, CARRY, MOVE, WORK, MOVE, CARRY, MOVE ], creep.body);
		});

		it('no spawn found', () => {
			info.clearLog();
			
			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 77;
			
			var object = new Explorer();
			
			var creep = object.spawnCreepFromSpawnName('ABC', 'Flag');
			assert.equal(false, creep);
			
			assert.equal(1, info.console.length);
			assert.equal('🛑 Could not find spawn: ABC', info.console[0]);
		});
	});

	describe('#spawnCreep', () => {
		it('find correct flag', () => {

			var spawn = new Spawn();
			spawn.name = 'My Spawn';
			spawn.room.energyAvailable = 50;

			var flag = new Spawn();
			flag.name = 'Flag Name';
			game.findAllFlags = () => [ flag ];
			
			var object = new Explorer();
			
			var spawnWasCalled = false;
			object.spawnCreepFromSpawn = (usedSpawn, flagName) => {
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
			game.findAllFlags = () => [ ];
			
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
			info.clearLog();
			
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
			info.clearLog();

			var droppedEnergy = new Spawn();
			droppedEnergy.pos.x = 12;
			droppedEnergy.pos.y = 13;
			
			var creep = new Creep('run');
			creep.store = new Store(100);
			creep.pos.findInRange = (type) => (type == FIND_DROPPED_RESOURCES) ? [ droppedEnergy ] : [];
			
			var object = new Explorer();
			
			// dropped energy is far away, so go there
			creep.pickup = resource => (resource == droppedEnergy) ? ERR_NOT_IN_RANGE : -1;
			object.work = (workingCreep) => assert.fail('Creep cannot work while moving!');
			
			object.run(creep);

			assert.equal(12, creep.pos.x);
			assert.equal(13, creep.pos.y);
			
			// dropped energy is close, so pickup
			creep.pickup = resource => (resource == droppedEnergy) ? OK : -1;
			
			var workCalled = false; 
			object.work = (workingCreep) => workCalled = true;
			
			object.run(creep);

			assert.equal(12, creep.pos.x);
			assert.equal(13, creep.pos.y);
			assert.equal(true, workCalled);

		});
	});

	
	describe('#goToFlagRoom', () => {
		var test = function(work) {
			var creep = new Creep();

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

			assert.equal(null, creep.memory.targetFlag);
			
			// first time this is called find flag and store it in memory 
			game.findAllFlags = () => [ flag1, flag2 ];
			
			work(object, creep);
			
			assert.equal('Flag Name 1', creep.memory.targetFlag);
			assert.equal(1, creep.pos.x);
			assert.equal(2, creep.pos.y);
			assert.equal(1, info.console.length);
			assert.equal('🏴 Explorer travels to Flag Name 1', info.console[0]);

			// second time this is called find flag and store it in memory 
			info.clearLog();
			creep.memory.targetFlag = 'Flag Name 2';
			
			work(object, creep);
			
			assert.equal('Flag Name 2', creep.memory.targetFlag);
			assert.equal(3, creep.pos.x);
			assert.equal(4, creep.pos.y);
			assert.equal(0, info.console.length);
			
			// third time the creep is in the same room, so switch phases
			flag2.pos.x = 5;
			flag2.pos.y = 6;
			flag2.room = creep.room;

			work(object, creep);

			assert.equal('Flag Name 2', creep.memory.targetFlag);
			assert.equal(5, creep.pos.x);
			assert.equal(6, creep.pos.y);
			assert.equal(1, info.console.length);
			assert.equal('🏴 Explorer claims the room of Flag Name 2', info.console[0]);
			assert.equal('claimFlagRoom', creep.memory.phase);
		};
		it('function', () => {
			test((explorer, creep) => explorer.goToFlagRoom(creep));
		});
		it('with #work', () => {
			test((explorer, creep) => explorer.work(creep));
		});
	});
	
	describe('#claimFlagRoom', () => {
		var test = function(work) {
			var creep = new Creep();

		};
		it('function', () => {
			test((explorer, creep) => explorer.goToFlagRoom(creep));
		});
		it('with #work', () => {
			test((explorer, creep) => explorer.work(creep));
		});
	});
});
