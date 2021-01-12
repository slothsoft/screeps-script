var classUnderTest = require('../src/main');
var assert = require('assert');

var info = require('../src/main.info');
var game = require('../src/main.game');

var Creep = require('./mock/creep-mock');

// TODO: Test these methods
// - spawnMiner

describe('main', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});

	describe('#selfdestruct', () => {
		it('with creep', () => {
			var creep = new Creep();
			selfdestruct(creep.id);

			assert.equal(true, creep.memory.selfdestruct);
		});

		it('without creep', () => {
			info.clearLog();
			
			selfdestruct("ID");

			assert.equal(1, info.console.length);
			assert.equal("🛑 Could not find creep: ID", info.console[0]);
		});
	});

	describe('#fetchOldestCreep', () => {
		it('with creeps', () => {
			info.clearLog();
			
			var creep1 = new Creep("A");
			creep1.ticksToLive = 200;
			var creep2 = new Creep("B");
			creep2.ticksToLive = 20;
			var creep3 = new Creep("C");
			creep3.ticksToLive = 2000;
			
			game.findAllCreeps = () => [ creep1, creep2, creep3 ];

			assert.equal(creep2, fetchOldestCreep());
			assert.equal(1, info.console.length);
			assert.equal("Oldest creep: B (20 ttl)", info.console[0]);
		});

		it('without creep', () => {
			info.clearLog();
			
			game.findAllCreeps = () => [ ];

			assert.equal(null, fetchOldestCreep());
			assert.equal(1, info.console.length);
			assert.equal("🛑 No creep found.", info.console[0]);
		});
	});
});