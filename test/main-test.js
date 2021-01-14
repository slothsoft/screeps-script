var classUnderTest = require('../src/main');
var assert = require('assert');

var info = require('../src/main.info');
var game = require('../src/main.game');

var Creep = require('./mock/creep-mock');
var Spawn = require('./mock/spawn-mock');

//All methods tested.

describe('main', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});

	beforeEach(() => {
		Game.clearAll();
		info.clearLog();
	});

	describe('#selfdestruct', () => {
		it('with creep', () => {
			var creep = new Creep();
			
			selfdestruct(creep.id);

			assert.equal(true, creep.memory.selfdestruct);
		});

		it('without creep', () => {
			selfdestruct('ID');

			assert.equal(1, info.console.length);
			assert.equal('🛑 Could not find creep: ID', info.console[0]);
		});
	});

	describe('#fetchOldestCreep', () => {
		it('with creeps', () => {
			var creep1 = new Creep('A');
			creep1.ticksToLive = 200;
			var creep2 = new Creep('B');
			creep2.ticksToLive = 20;
			var creep3 = new Creep('C');
			creep3.ticksToLive = 2000;
			
			game.findAllCreeps = () => [ creep1, creep2, creep3 ];

			assert.equal(creep2, fetchOldestCreep());
			assert.equal(1, info.console.length);
			assert.equal('Oldest creep: B (20 ttl)', info.console[0]);
		});

		it('without creep', () => {
			game.findAllCreeps = () => [ ];

			assert.equal(null, fetchOldestCreep());
			assert.equal(1, info.console.length);
			assert.equal('🛑 No creep found.', info.console[0]);
		});
	});

	describe('#spawnMiner', () => {
		it('no spawn', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 50;
			
			var creep = spawnMiner(spawn.id, 'Source');
			assert.equal(false, creep);
		});
		
		it('spawn', () => {
			var spawn = new Spawn();
			spawn.name = 'Main';
			spawn.room.energyAvailable = 300;
			
			var creep = spawnMiner(spawn.name, 'Source');
			assert.notEqual(false, creep);
			assert.equal(spawn.name, creep.memory.homeSpawn);
			assert.equal('Source', creep.memory.homeSource);
			assert.equal(Game.creeps['Miner 1'], creep);
			assert.deepEqual([MOVE, CARRY, WORK], creep.body);

			assert.equal(1, info.console.length);
			assert.equal('🛒 Spawning new Miner (3p)', info.console[0]);
		});

		it('no spawn', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 77;
			
			var creep = spawnMiner('ABC');
			assert.equal(false, creep);
			
			assert.equal(1, info.console.length);
			assert.equal('🛑 Could not find spawn: ABC', info.console[0]);
		});
	});
});