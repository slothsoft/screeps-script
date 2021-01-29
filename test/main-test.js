var classUnderTest = require('../src/main');
var assert = require('assert');

var constants = require('../src/main.constants');
var info = require('../src/main.info');
var MainUtil = require('../src/main.util');

var Creep = require('./mock/creep-mock');
var Room = require('./mock/room-mock');
var Spawn = require('./mock/spawn-mock');

// All methods tested.

describe('main', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});

	beforeEach(() => {
		Game.clearAll();
		info.clearLines();
	});

	describe('#selfdestruct', () => {
		it('with creep', () => {
			var creep = new Creep();
			
			selfdestruct(creep.id);

			assert.equal(true, creep.memory.selfdestruct);
		});

		it('without creep', () => {
			selfdestruct('ID');

			assert.equal(1, info.getLines().length);
			assert.equal('🛑 Could not find creep: ID', info.getLine(0));
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
			
			MainUtil.findAllCreeps = () => [ creep1, creep2, creep3 ];

			assert.equal(creep2, fetchOldestCreep());
			assert.equal(1, info.getLines().length);
			assert.equal('Oldest creep: B (20 ttl)', info.getLine(0));
		});

		it('without creep', () => {
			MainUtil.findAllCreeps = () => [ ];

			assert.equal(null, fetchOldestCreep());
			assert.equal(1, info.getLines().length);
			assert.equal('🛑 No creep found.', info.getLine(0));
		});
	});

	describe('#spawnMiner', () => {
		it('no spawn', () => {
			var spawn = new Spawn();
			spawn.name = 'Main';
			spawn.room.energyAvailable = 50;
			
			var creep = spawnMiner(spawn.name, 'Source');
			assert.equal(false, creep);
		});
		
		it('spawn', () => {
			var spawn = new Spawn();
			spawn.name = 'Main';
			spawn.room.energyAvailable = 300;
			
			var creep = spawnMiner(spawn.name, 'Source');
			assert.notEqual(false, creep);
			assert.equal(spawn.name, creep.memory.homeSpawn);
			assert.equal('Source', creep.memory.source);
			assert.equal(Game.creeps['Miner 1'], creep);
			assert.deepEqual([MOVE, CARRY, WORK], creep.body);

			assert.equal(1, info.getLines().length);
			assert.equal('🛒 Spawning new Miner (3p)', info.getLine(0));
		});

		it('no spawn', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 77;
			
			var creep = spawnMiner('ABC');
			assert.equal(false, creep);
			
			assert.equal(1, info.getLines().length);
			assert.equal('🛑 Could not find spawn: ABC', info.getLine(0));
		});
	});

	describe('#spawnExplorer', () => {
		it('no spawn', () => {
			var spawn = new Spawn();
			spawn.name = 'Main';
			spawn.room.energyAvailable = 50;
			
			var creep = spawnExplorer(spawn.name, 'Flag');
			assert.equal(false, creep);
		});
		
		it('spawn', () => {
			var spawn = new Spawn();
			spawn.name = 'Main';
			spawn.room.energyAvailable = 930;
			
			var creep = spawnExplorer(spawn.name, 'Flag');
			assert.notEqual(false, creep);
			assert.equal('Flag', creep.memory.target);
			assert.equal(Game.creeps['Explorer 1'], creep);
			assert.deepEqual([ CLAIM, MOVE, WORK, MOVE, CARRY, MOVE ], creep.body);

			assert.equal(1, info.getLines().length);
			assert.equal('🏴 Spawning new Explorer (6p)', info.getLine(0));
		});

		it('no spawn', () => {
			var spawn = new Spawn();
			spawn.room.energyAvailable = 77;
			
			var creep = spawnExplorer('ABC');
			assert.equal(false, creep);
			
			assert.equal(1, info.getLines().length);
			assert.equal('🛑 Could not find spawn: ABC', info.getLine(0));
		});
	});

	describe('#makeLinkTarget', () => {
		it('no type present', () => {
			var structure = structure = {
				id: 'ID',
			};
			Game.getObjectById = id => structure;
			
			makeLinkTarget('ID');
			
			assert.equal(constants.LINK_TYPE_TARGET, structure.memory.type);
			assert.equal(constants.LINK_TYPE_TARGET, Memory.structures.ID.type);
		});

		it('type already present', () => {
			var structure = structure = {
				id: 'ID',
				memory: {
					type: constants.LINK_TYPE_SOURCE,
				},
			};
			Game.getObjectById = id => structure;
			
			makeLinkTarget('ID');
			
			assert.equal(constants.LINK_TYPE_TARGET, structure.memory.type);
			assert.equal(constants.LINK_TYPE_TARGET, Memory.structures.ID.type);
		});
	});

	describe('#makeLinkSource', () => {
		it('no type present', () => {
			var structure = structure = {
				id: 'ID',
			};
			Game.getObjectById = id => structure;
			
			makeLinkSource('ID');
			
			assert.equal(constants.LINK_TYPE_SOURCE, structure.memory.type);
			assert.equal(constants.LINK_TYPE_SOURCE, Memory.structures.ID.type);
		});

		it('type already present', () => {
			var structure = structure = {
				id: 'ID',
				memory: {
					type: constants.LINK_TYPE_TARGET,
				},
			};
			Game.getObjectById = id => structure;
			
			makeLinkSource('ID');
			
			assert.equal(constants.LINK_TYPE_SOURCE, structure.memory.type);
			assert.equal(constants.LINK_TYPE_SOURCE, Memory.structures.ID.type);
		});
	});

	describe('#spawnCreepForRoom', () => {
		it('spawn', () => {
			
			var room = new Room();
			room.memory.base = { name: 'A23D56' };
			room.energyAvailable = 1000;
			
			var spawn = new Spawn(room);
			spawn.memory.home = 'A23D56';
			
			var spawnedCreep = spawnCreepForRoom(room.name, 'Harvester');
			assert.notEqual(false, spawnedCreep);
			assert.equal('Harvester 1', spawnedCreep.name);

			assert.equal(0, info.getLines().length);
		});

		it('spawn with debug', () => {
			
			var room = new Room();
			room.memory.base = { name: 'A23D56' };
			room.energyAvailable = 1000;
			
			var spawn = new Spawn(room);
			spawn.memory.home = 'A23D56';
			spawn.memory.debug = true;
			
			var spawnedCreep = spawnCreepForRoom(room.name, 'Harvester');
			assert.notEqual(false, spawnedCreep);
			assert.equal('Harvester 1', spawnedCreep.name);

			assert.equal(1, info.getLines().length);
			assert.equal('🧺 Spawning new Harvester (12p)', info.getLine(0));
		});

		it('no room found', () => {

			var room = new Room();
			room.memory.base = { name: 'A23D56' };
			room.energyAvailable = 1000;
			
			var spawn = new Spawn(room);
			spawn.memory.home = 'A23D56';
			
			var spawnedCreep = spawnCreepForRoom('other', 'Harvester');
			assert.equal(false, spawnedCreep);

			assert.equal(1, info.getLines().length);
			assert.equal('🛑 Could not find room: other', info.getLine(0));
		});

		it('no role found', () => {
			
			var room = new Room();
			room.memory.base = { name: 'A23D56' };
			room.energyAvailable = 1000;
			
			var spawn = new Spawn(room);
			spawn.memory.home = 'A23D56';
			
			var spawnedCreep = spawnCreepForRoom(room.name, '1234567890');
			assert.equal(false, spawnedCreep);

			assert.equal(1, info.getLines().length);
			assert.equal('🛑 Could not find role: 1234567890', info.getLine(0));
		});
	});

	describe('#moveCreepTo', () => {
		it('move', () => {
			
			var creep = new Creep('run');
	
			var gameObject = new Spawn();
			gameObject.pos.x = 13;
			gameObject.pos.y = 42;
	
			Game.getObjectById = id => id == gameObject.id ? gameObject : null;
			
			moveCreepTo(creep.id, gameObject.id);
	
			assert.equal(gameObject.id, creep.memory.moveToGameObject);
		});

		it('no creep', () => {
			
			var gameObject = new Spawn();
			gameObject.pos.x = 13;
			gameObject.pos.y = 42;
	
			Game.getObjectById = id => id == gameObject.id ? gameObject : null;
			
			moveCreepTo('unknown', gameObject.id);
	
			assert.equal(1, info.getLines().length);
			assert.equal('🛑 Could not find creep: unknown', info.getLine(0));
		});
		
		it('no game object', () => {
			
			var creep = new Creep('run');
	
			Game.getObjectById = id => null;
			
			moveCreepTo(creep.id, 'unknown');

			assert.equal(1, info.getLines().length);
			assert.equal('🛑 Could not find game object: unknown', info.getLine(0));
		});
	});

	describe('#clearConsole', () => {
		it('simple', () => {
			info.log('A');
			info.log('B');
			info.log('C');

			clearConsole();

			assert.equal(info.getLines().length, 0);
		});
	});
});