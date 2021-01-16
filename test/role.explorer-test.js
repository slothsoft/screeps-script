var Explorer = require('../src/role.explorer');
var assert = require('assert');

var constants = require('../src/main.constants');
var info = require('../src/main.info');
var game = require('../src/main.game');

var Creep = require('./mock/creep-mock');
var Room = require('./mock/room-mock.js');
var Spawn = require('./mock/spawn-mock');

// TODO: Test all methods.
//work()
//goToFlagRoom()

const PHASE_GOTO_FLAG_ROOM = 'gotoFlagRoom';
const PHASE_CLAIM_FLAG_ROOM = 'claimFlagRoom';

describe('role.explorer', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	});

	beforeEach(() => {
		Game.clearAll();
	});
	
	it('exists', () => {
		var startsWith = 'class Explorer';
		assert.equal(startsWith, Explorer.toString().substring(0, startsWith.length));
		
		var object = new Explorer();
		assert.equal('Explorer', object.roleName);
		assert.equal(0, object.requiredNumber);
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
			flag.name = "Flag Name";
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
	
	describe('#findTargets', () => {
		it('find correct structures', () => {

			var flag = new Spawn();
			flag.name = 'My Flag';
			
			game.findAllFlags = () => [ flag ];

			var object = new Explorer();
			assert.deepEqual([ flag ], object.findTargets(flag.room));
		});
	});
	
});
