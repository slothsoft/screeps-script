var BaseManager = require('../src/manager.base');
var assert = require('assert');

var constants = require('../src/main.constants');
var game = require('../src/main.game');
var info = require('../src/main.info');

var Creep = require('./mock/creep-mock');
var Room = require('./mock/room-mock');
var Spawn = require('./mock/spawn-mock');

describe('manager.base', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	    constants.DEBUG_ROLES = false;
	});
	
	beforeEach(() => {
		Game.clearAll();
	});
	
	it('exists', () => {
		var startsWith = 'class BaseManager';
		assert.equal(startsWith, BaseManager.toString().substring(0, startsWith.length));
	});

	describe('#fetchFreeSpawn', () => {
		it('exists', () => {
			
			var spawn1 = new Spawn();
			spawn1.spawning = true;
			
			var spawn2 = new Spawn(spawn1.room);
			spawn2.spawning = false;
			
			var spawn3 = new Spawn(spawn1.room);
			spawn3.spawning = true;

			BaseManager.init();
			var manager = new BaseManager(spawn1.room);
			
			assert.deepEqual(spawn2, manager.fetchFreeSpawn());
		});

		it('empty list', () => {
			var room = new Room();
			room.memory.base = 'Dresden'; // a room without base will never be run
			
			BaseManager.init();
			var manager = new BaseManager(room);
			
			assert.deepEqual(null, manager.fetchFreeSpawn());
		});

		it('none exists', () => {
			
			var spawn1 = new Spawn();
			spawn1.spawning = true;
			
			var spawn2 = new Spawn(spawn1.room);
			spawn2.spawning = true;
			
			var spawn3 = new Spawn(spawn1.room);
			spawn3.spawning = true;

			BaseManager.init();
			var manager = new BaseManager(spawn1.room);
			
			assert.deepEqual(null, manager.fetchFreeSpawn());
		});
	});

	describe('#spawnCreepForRole', () => {
		it('spawn', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';

			var spawn = new Spawn();
			
			var creep = new Creep('spawnCreepForRole', [ MOVE ]);
			
			role.spawnCreep = freeSpawn => {
				assert.deepEqual(freeSpawn, spawn);
				return creep;
			};
			
			BaseManager.init();
			info.clearLog();
			
			var manager = new BaseManager(spawn.room);
			
			var spawnedCreep = manager.spawnCreepForRole(role);
			assert.deepEqual(creep, spawnedCreep);

			assert.equal(1, info.console.length);
			assert.equal('! Spawning new Role (1p)', info.console[0]);
		});

		it('no free spawn', () => {
			
			var role = {};

			var creep = new Creep('spawnCreepForRole', [ MOVE ]);
			
			role.spawnCreep = freeSpawn =>  assert.fail('Where did the spawn come from: ' + freeSpawn);

			var room = new Room();
			room.memory.base = 'Dresden'; // a room without base will never be run
			
			BaseManager.init();
			info.clearLog();
			
			var manager = new BaseManager(room);
			
			var spawnedCreep = manager.spawnCreepForRole(role);
			assert.equal(false, spawnedCreep);

			assert.equal(0, info.console.length);
		});

		it('error while spawning', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';

			var spawn = new Spawn();
			
			role.spawnCreep = freeSpawn => {
				assert.deepEqual(freeSpawn, spawn);
				return false;
			};
			
			BaseManager.init();
			info.clearLog();
			
			var manager = new BaseManager(spawn.room);
			
			var spawnedCreep = manager.spawnCreepForRole(role);
			assert.equal(false, spawnedCreep);

			assert.equal(0, info.console.length);
		});
	});

	
	describe('#repopulateCreeps', () => {
		it('spawn', () => {

			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';

			var spawn = new Spawn();
			
			var spawnCreepCalled = false;
			role.spawnCreep = freeSpawn => {
				spawnCreepCalled = true;
				assert.deepEqual(freeSpawn, spawn);
				return new Creep('repopulateCreeps', [ MOVE ]);
			};

			BaseManager.init();
			info.clearLog();

			spawn.room.memory.base.roleConfig = { Role :  { requiredNumber : 1 } };

			var manager = new BaseManager(spawn.room);
			manager.allRoles = [role];
			manager.repopulateCreeps();
			
			assert.equal(true, spawnCreepCalled);

			assert.equal(1, info.console.length);
			assert.equal('! Spawning new Role (1p)', info.console[0]);
		});

		it('no spawn necessary', () => {

			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';

			var spawn = new Spawn();
			
			var spawnCreepCalled = false;
			role.spawnCreep = freeSpawn => {
				spawnCreepCalled = true;
				return new Creep('repopulateCreeps', [ MOVE ]);
			};

			
			BaseManager.init();
			info.clearLog();

			spawn.room.memory.base.roleConfig = { Role :  { requiredNumber : 0 } };

			var manager = new BaseManager(spawn.room);
			manager.allRoles = [role];
			manager.repopulateCreeps();
			
			assert.equal(false, spawnCreepCalled);
			assert.equal(0, info.console.length);
		});

		it('do not spawn two per round', () => {

			var role1 = {};
			role1.symbol = '&';
			role1.roleName = 'Role1';

			var role2 = {};
			role2.symbol = '$';
			role2.roleName = 'Role2';

			var spawn = new Spawn();
			
			var spawnCreepCalled = 0;
			role1.spawnCreep = freeSpawn => {
				spawnCreepCalled++;
				assert.deepEqual(freeSpawn, spawn);
				return new Creep('repopulateCreeps', [ MOVE ]);
			};
			role2.spawnCreep = role1.spawnCreep;

			BaseManager.init();
			info.clearLog();

			spawn.room.memory.base.roleConfig = { 
					Role1 :  { requiredNumber : 1 },   
					Role2 :  { requiredNumber : 1 }, 
			};

			var manager = new BaseManager(spawn.room);
			manager.allRoles = [role1, role2];
			manager.repopulateCreeps();
			
			assert.equal(1, spawnCreepCalled);

			assert.equal(1, info.console.length);
			assert.equal('& Spawning new Role1 (1p)', info.console[0]);
		});
	});

	describe('#spawnCreepForRole', () => {
		it('spawn', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';

			var spawn = new Spawn();
			
			var creep = new Creep('spawnCreepForRole', [ MOVE ]);
			
			role.spawnCreep = freeSpawn => {
				assert.deepEqual(freeSpawn, spawn);
				return creep;
			};
			
			BaseManager.init();
			info.clearLog();
			
			var manager = new BaseManager(spawn.room);
			
			var spawnedCreep = manager.spawnCreepForRole(role);
			assert.deepEqual(creep, spawnedCreep);

			assert.equal(1, info.console.length);
			assert.equal('! Spawning new Role (1p)', info.console[0]);
		});

		it('no free spawn', () => {
			
			var role = {};

			var creep = new Creep('spawnCreepForRole', [ MOVE ]);
			
			role.spawnCreep = freeSpawn =>  assert.fail('Where did the spawn come from: ' + freeSpawn);

			var room = new Room();
			room.memory.base = 'Dresden'; // a room without base will never be run
			
			BaseManager.init();
			info.clearLog();
			
			var manager = new BaseManager(room);
			
			var spawnedCreep = manager.spawnCreepForRole(role);
			assert.equal(false, spawnedCreep);

			assert.equal(0, info.console.length);
		});

		it('error while spawning', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';

			var spawn = new Spawn();
			
			role.spawnCreep = freeSpawn => {
				assert.deepEqual(freeSpawn, spawn);
				return false;
			};
			
			BaseManager.init();
			info.clearLog();
			
			var manager = new BaseManager(spawn.room);
			
			var spawnedCreep = manager.spawnCreepForRole(role);
			assert.equal(false, spawnedCreep);

			assert.equal(0, info.console.length);
		});
	});

	describe('#showSpawningAnimation', () => {
		// this is much easier tested in the game
	});
	
	describe('#initRoleInfo', () => {
		it('room without base', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';

			var room = new Room();
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			manager.initRoleInfo();
			
			assert.equal(true, typeof room.memory.roleInfo !== 'undefined');
			assert.equal(true, typeof room.memory.roleInfo['Role'] !== 'undefined');
			assert.equal('!', room.memory.roleInfo['Role'].symbol);
			assert.equal(-1, room.memory.roleInfo['Role'].requiredNumber);
			assert.equal(0, room.memory.roleInfo['Role'].currentNumber);
		});

		it('room with base', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';
			role.requiredNumber = 7;

			var spawn = new Spawn();
			var room = spawn.room;
			
			BaseManager.init();
			info.clearLog();

			assert.equal(true, typeof room.memory.base !== 'undefined');
			assert.equal('Dresden', room.memory.base.name);
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			manager.initRoleInfo();

			assert.equal(true, typeof room.memory.roleInfo !== 'undefined');
			assert.equal(true, typeof room.memory.roleInfo['Role'] !== 'undefined');
			assert.equal('!', room.memory.roleInfo['Role'].symbol);
			assert.equal(7, room.memory.roleInfo['Role'].requiredNumber);
			assert.equal(0, room.memory.roleInfo['Role'].currentNumber);
		});

		it('room with defined base', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';
			role.requiredNumber = 7;

			var spawn = new Spawn();
			var room = spawn.room;
			
			BaseManager.init();
			info.clearLog();

			assert.equal(true, typeof room.memory.base !== 'undefined');
			assert.equal('Dresden', room.memory.base.name);
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			manager.initRoleInfo();

			spawn.room.memory.base.roleConfig = { Role :  { requiredNumber : 42 } };
			
			manager.initRoleInfo();

			assert.equal(true, typeof room.memory.roleInfo !== 'undefined');
			assert.equal(true, typeof room.memory.roleInfo['Role'] !== 'undefined');
			assert.equal('!', room.memory.roleInfo['Role'].symbol);
			assert.equal(42, room.memory.roleInfo['Role'].requiredNumber);
			assert.equal(0, room.memory.roleInfo['Role'].currentNumber);
		});

		it('room argument', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';
			role.requiredNumber = 7;

			var spawn = new Spawn();
			var room = spawn.room;
			
			BaseManager.init();
			info.clearLog();

			assert.equal(true, typeof room.memory.base !== 'undefined');
			assert.equal('Dresden', room.memory.base.name);
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			
			var otherRoom = new Room();
			manager.initRoleInfo(otherRoom);

			assert.equal(true, typeof otherRoom.memory.roleInfo !== 'undefined');
			assert.equal(true, typeof otherRoom.memory.roleInfo['Role'] !== 'undefined');
			assert.equal('!', otherRoom.memory.roleInfo['Role'].symbol);
			assert.equal(-1, otherRoom.memory.roleInfo['Role'].requiredNumber);
			assert.equal(0, otherRoom.memory.roleInfo['Role'].currentNumber);
		});
	});
	

	describe('#initRoleInfoIfNecessary', () => {
		it('room without base', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';

			var room = new Room();
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			manager.initRoleInfoIfNecessary();
			
			assert.equal(true, typeof room.memory.roleInfo !== 'undefined');
			assert.equal(true, typeof room.memory.roleInfo['Role'] !== 'undefined');
			assert.equal('!', room.memory.roleInfo['Role'].symbol);
			assert.equal(-1, room.memory.roleInfo['Role'].requiredNumber);
			assert.equal(0, room.memory.roleInfo['Role'].currentNumber);
		});

		it('room with base', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';
			role.requiredNumber = 7;

			var spawn = new Spawn();
			var room = spawn.room;
			
			BaseManager.init();
			info.clearLog();

			assert.equal(true, typeof room.memory.base !== 'undefined');
			assert.equal('Dresden', room.memory.base.name);
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			manager.initRoleInfoIfNecessary();

			assert.equal(true, typeof room.memory.roleInfo !== 'undefined');
			assert.equal(true, typeof room.memory.roleInfo['Role'] !== 'undefined');
			assert.equal('!', room.memory.roleInfo['Role'].symbol);
			assert.equal(7, room.memory.roleInfo['Role'].requiredNumber);
			assert.equal(0, room.memory.roleInfo['Role'].currentNumber);
		});

		it('room with defined base', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';
			role.requiredNumber = 7;

			var spawn = new Spawn();
			var room = spawn.room;
			
			BaseManager.init();
			info.clearLog();

			assert.equal(true, typeof room.memory.base !== 'undefined');
			assert.equal('Dresden', room.memory.base.name);
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			manager.initRoleInfoIfNecessary();

			spawn.room.memory.base.roleConfig = { Role :  { requiredNumber : 42 } };
			
			manager.initRoleInfoIfNecessary();

			assert.equal(true, typeof room.memory.roleInfo !== 'undefined');
			assert.equal(true, typeof room.memory.roleInfo['Role'] !== 'undefined');
			assert.equal('!', room.memory.roleInfo['Role'].symbol);
			assert.equal(7, room.memory.roleInfo['Role'].requiredNumber);
			assert.equal(0, room.memory.roleInfo['Role'].currentNumber);
		});

		it('room argument', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';
			role.requiredNumber = 7;

			var spawn = new Spawn();
			var room = spawn.room;
			
			BaseManager.init();
			info.clearLog();

			assert.equal(true, typeof room.memory.base !== 'undefined');
			assert.equal('Dresden', room.memory.base.name);
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			
			var otherRoom = new Room();
			manager.initRoleInfoIfNecessary(otherRoom);

			assert.equal(true, typeof otherRoom.memory.roleInfo !== 'undefined');
			assert.equal(true, typeof otherRoom.memory.roleInfo['Role'] !== 'undefined');
			assert.equal('!', otherRoom.memory.roleInfo['Role'].symbol);
			assert.equal(-1, otherRoom.memory.roleInfo['Role'].requiredNumber);
			assert.equal(0, otherRoom.memory.roleInfo['Role'].currentNumber);
		});
	});

	describe('#runBase', () => {
		it('no base', () => {
			
			var room = new Room();
			
			var manager = new BaseManager(room);
			
			var initRoleInfo = false;
			manager.initRoleInfo = () => initRoleInfo = true;

			var repopulateCreeps = false;
			manager.repopulateCreeps = () => repopulateCreeps = true;

			var showSpawningAnimation = false;
			manager.showSpawningAnimation = () => showSpawningAnimation = true;

			var moveCreeps = false;
			manager.moveCreeps = () => moveCreeps = true;
			
			manager.runBase();
			
			assert.equal(true, initRoleInfo);
			assert.equal(false, repopulateCreeps);
			assert.equal(false, showSpawningAnimation);
			assert.equal(false, moveCreeps);
		});

		it('with base', () => {

			var spawn = new Spawn();
			var room = spawn.room;
			
			BaseManager.init();
			info.clearLog();
			
			var manager = new BaseManager(room);
			
			var initRoleInfo = false;
			manager.initRoleInfo = () => initRoleInfo = true;

			var repopulateCreeps = false;
			manager.repopulateCreeps = () => repopulateCreeps = true;

			var showSpawningAnimation = false;
			manager.showSpawningAnimation = () => showSpawningAnimation = true;

			var moveCreeps = false;
			manager.moveCreeps = () => moveCreeps = true;
			
			manager.runBase();
			
			assert.equal(true, initRoleInfo);
			assert.equal(true, repopulateCreeps);
			assert.equal(true, showSpawningAnimation);
			assert.equal(true, moveCreeps);
		});
	});

	describe('#runBase', () => {
		it('find', () => {
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';
			role.requiredNumber = 7;
			
			var manager = new BaseManager(new Room());
			manager.allRoles = [ role ];

			assert.deepEqual(role, manager.findMandatoryRole('Role'));
			assert.equal(0, info.console.length);
		});

		it('find default', () => {
			var defaultRole = {};
			defaultRole.symbol = '?';
			defaultRole.roleName = 'Other';
			defaultRole.requiredNumber = 4;
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';
			role.requiredNumber = 7;
			
			var manager = new BaseManager(new Room());
			manager.allRoles = [ role ];
			manager.defaultRole = defaultRole;

			assert.deepEqual(defaultRole, manager.findMandatoryRole('Rolo'));

			assert.equal(1, info.console.length);
			assert.equal('🛑 COULD NOT FIND ROLE: Rolo 🛑', info.console[0]);
		});
	});

	describe('#findNecessaryMandatoryRole', () => {
		it('find directly', () => {
			
			var role1 = {};
			role1.symbol = '!';
			role1.roleName = 'First';
			role1.requiredNumber = 7;
			role1.isNecessary = room => true;

			var role2 = {};
			role2.symbol = '.';
			role2.roleName = 'Second';
			role2.requiredNumber = 42;
			role2.isNecessary = room => true;

			var defaultRole = {};
			defaultRole.symbol = '?';
			defaultRole.roleName = 'Default';
			defaultRole.requiredNumber = 4;
			defaultRole.isNecessary = room => true;

			var spawn = new Spawn();
			var room = spawn.room;

			BaseManager.init();
			info.clearLog();
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role1, role2 ];
			manager.defaultRole = defaultRole;
			manager.initRoleInfo();

			assert.deepEqual(role1, manager.findNecessaryMandatoryRole('First'));
			assert.deepEqual(role2, manager.findNecessaryMandatoryRole('Second'));
			assert.equal(0, info.console.length);
		});

		it('do not find', () => {
			
			var role1 = {};
			role1.symbol = '!';
			role1.roleName = 'First';
			role1.requiredNumber = 7;
			role1.isNecessary = room => true;

			var role2 = {};
			role2.symbol = '.';
			role2.roleName = 'Second';
			role2.requiredNumber = 42;
			role2.isNecessary = room => true;

			var defaultRole = {};
			defaultRole.symbol = '?';
			defaultRole.roleName = 'Default';
			defaultRole.requiredNumber = 4;
			defaultRole.isNecessary = room => true;

			var spawn = new Spawn();
			var room = spawn.room;

			BaseManager.init();
			info.clearLog();
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role1, role2 ];
			manager.defaultRole = defaultRole;
			manager.initRoleInfo();

			assert.deepEqual(defaultRole, manager.findNecessaryMandatoryRole('Third'));
			assert.equal(1, info.console.length);
			assert.equal('🛑 COULD NOT FIND ROLE: Third 🛑', info.console[0]);
		});
		
		it('find necessary', () => {
			
			var role1 = {};
			role1.symbol = '!';
			role1.roleName = 'First';
			role1.requiredNumber = 7;
			role1.isNecessary = room => false;

			var role2 = {};
			role2.symbol = '.';
			role2.roleName = 'Second';
			role2.requiredNumber = 42;
			role2.isNecessary = room => true;

			var defaultRole = {};
			defaultRole.symbol = '?';
			defaultRole.roleName = 'Default';
			defaultRole.requiredNumber = 4;
			defaultRole.isNecessary = room => true;

			var spawn = new Spawn();
			var room = spawn.room;

			BaseManager.init();
			info.clearLog();
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role1, role2 ];
			manager.defaultRole = defaultRole;
			manager.initRoleInfo();
			
			assert.deepEqual(role2, manager.findNecessaryMandatoryRole('First'));
			assert.deepEqual(role2, manager.findNecessaryMandatoryRole('Second'));
			assert.equal(0, info.console.length);
		});

		it('find default necessary', () => {
			
			var role1 = {};
			role1.symbol = '!';
			role1.roleName = 'First';
			role1.requiredNumber = 7;
			role1.isNecessary = room => false;

			var role2 = {};
			role2.symbol = '.';
			role2.roleName = 'Second';
			role2.requiredNumber = 42;
			role2.isNecessary = room => true;

			var defaultRole = {};
			defaultRole.symbol = '?';
			defaultRole.roleName = 'Default';
			defaultRole.requiredNumber = 4;
			defaultRole.isNecessary = room => false;

			var spawn = new Spawn();
			var room = spawn.room;

			BaseManager.init();
			info.clearLog();
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role1, role2 ];
			manager.defaultRole = defaultRole;
			manager.initRoleInfo();
			
			assert.deepEqual(role2, manager.findNecessaryMandatoryRole('Third'));
			assert.equal(1, info.console.length);
			assert.equal('🛑 COULD NOT FIND ROLE: Third 🛑', info.console[0]);
		});
	});

	describe('#moveCreeps', () => {
		it('move creeps', () => {
			var role1 = {};
			role1.roleName = 'First';
			role1.isNecessary = room => false;
			
			var creep1 = new Creep();
			creep1.memory.role = role1.roleName;
			
			var run1Called = false;
			role1.run = creep =>  {
				run1Called = true;
				assert.deepEqual(creep1, creep);
			};

			var role2 = {};
			role2.roleName = 'Second';
			role2.isNecessary = room => true;

			var creep2 = new Creep();
			creep2.memory.role = role2.roleName;

			var run2Called = false;
			role2.run = creep =>  {
				run2Called = true;
				assert.deepEqual(creep2, creep);
			};

			var spawn = new Spawn();
			var room = spawn.room;

			BaseManager.init();
			info.clearLog();

			assert.equal(true, room.memory.base.name != null);
			creep1.memory.home = room.memory.base.name;
			creep2.memory.home = room.memory.base.name;
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role1, role2 ];
			game.findAllCreeps = () => [creep1, creep2];
			
			manager.initRoleInfo();
			manager.moveCreeps();

			assert.equal(true, run1Called);
			assert.equal(true, run2Called);
		});

		it('catch exception', () => {
			var role = {};
			role.roleName = 'First';
			role.isNecessary = room => false;
			
			var creep = new Creep();
			creep.memory.role = role.roleName;
			
			var runCalled = false;
			role.run = creep =>  {
				runCalled = true;
				throw 'Ignore me, please!';
			};

			var spawn = new Spawn();
			var room = spawn.room;

			BaseManager.init();
			info.clearLog();

			assert.equal(true, room.memory.base.name != null);
			creep.memory.home = room.memory.base.name;
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			game.findAllCreeps = () => [creep];
			
			manager.initRoleInfo();
			manager.moveCreeps();

			assert.equal(true, runCalled);
		});

		it('ignore spawning', () => {
			var role = {};
			role.roleName = 'First';
			role.isNecessary = room => false;
			
			var creep = new Creep();
			creep.memory.role = role.roleName;
			creep.spawning = true;
			
			var runCalled = false;
			role.run = creep =>  {
				runCalled = true;
			};

			var spawn = new Spawn();
			var room = spawn.room;

			BaseManager.init();
			info.clearLog();

			assert.equal(true, room.memory.base.name != null);
			creep.memory.home = room.memory.base.name;
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			game.findAllCreeps = () => [creep];
			
			manager.initRoleInfo();
			manager.moveCreeps();

			assert.equal(false, runCalled);
		});

		it('ignore other bases', () => {
			var role = {};
			role.roleName = 'First';
			role.isNecessary = room => false;
			
			var creep = new Creep();
			creep.memory.role = role.roleName;
			creep.spawning = true;
			
			var runCalled = false;
			role.run = creep =>  {
				runCalled = true;
			};

			var spawn = new Spawn();
			var room = spawn.room;

			BaseManager.init();
			info.clearLog();

			assert.equal(true, room.memory.base.name != null);
			creep.memory.home = 'Chemnitz'; // we don't associate with these guys
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			game.findAllCreeps = () => [creep];
			
			manager.initRoleInfo();
			manager.moveCreeps();

			assert.equal(false, runCalled);
		});
	});

	describe('#getRequiredNumberForRoomAndRole', () => {
		it('not defined no base', () => {
			var role = {};
			role.roleName = 'Role';
			role.requiredNumber = 7;
			
			var room = new Room();
			
			var manager = new BaseManager(room);
			
			assert.equal(-1, manager.getRequiredNumberForRoomAndRole(room, role));
		});

		it('not defined but base', () => {
			var role = {};
			role.roleName = 'Role';
			role.requiredNumber = 7;
			
			var room = new Room();
			room.memory.base = {};
			
			var manager = new BaseManager(room);
			
			assert.equal(7, manager.getRequiredNumberForRoomAndRole(room, role));
		});

		it('defined in base', () => {
			var role = {};
			role.roleName = 'Role';
			role.requiredNumber = 7;
			
			var room = new Room();
			room.memory.base = { roleConfig : { Role :  { requiredNumber : 1 } } };
			
			var manager = new BaseManager(room);
			
			assert.equal(1, manager.getRequiredNumberForRoomAndRole(room, role));
		});
	});
	
	describe('#initBaseRoleConfig', () => {
		it('room with base', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';
			role.requiredNumber = 7;

			var spawn = new Spawn();
			var room = spawn.room;
			
			BaseManager.init();
			info.clearLog();

			assert.equal(true, typeof room.memory.base !== 'undefined');
			assert.equal('Dresden', room.memory.base.name);
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			manager.initBaseRoleConfig();

			assert.equal(true, typeof room.memory.base.roleConfig !== 'undefined');
			assert.equal(true, typeof room.memory.base.roleConfig['Role'] !== 'undefined');
			assert.equal(7, room.memory.base.roleConfig['Role'].requiredNumber);
		});

		it('room with defined base', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';
			role.requiredNumber = 7;

			var spawn = new Spawn();
			var room = spawn.room;
			
			BaseManager.init();
			info.clearLog();

			assert.equal(true, typeof room.memory.base !== 'undefined');
			assert.equal('Dresden', room.memory.base.name);
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			manager.initBaseRoleConfig();

			spawn.room.memory.base.roleConfig = { Role :  { requiredNumber : 42 } };
			
			manager.initBaseRoleConfig();

			assert.equal(true, typeof room.memory.base.roleConfig !== 'undefined');
			assert.equal(true, typeof room.memory.base.roleConfig['Role'] !== 'undefined');
			assert.equal(7, room.memory.base.roleConfig['Role'].requiredNumber);
		});
	});
	
	describe('#initBaseRoleConfigIfNecessary', () => {
		it('room with base', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';
			role.requiredNumber = 7;

			var spawn = new Spawn();
			var room = spawn.room;
			
			BaseManager.init();
			info.clearLog();

			assert.equal(true, typeof room.memory.base !== 'undefined');
			assert.equal('Dresden', room.memory.base.name);
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			manager.initBaseRoleConfigIfNecessary();

			assert.equal(true, typeof room.memory.base.roleConfig !== 'undefined');
			assert.equal(true, typeof room.memory.base.roleConfig['Role'] !== 'undefined');
			assert.equal(7, room.memory.base.roleConfig['Role'].requiredNumber);
		});

		it('room with defined base', () => {
			
			var role = {};
			role.symbol = '!';
			role.roleName = 'Role';
			role.requiredNumber = 7;

			var spawn = new Spawn();
			var room = spawn.room;
			
			BaseManager.init();
			info.clearLog();

			assert.equal(true, typeof room.memory.base !== 'undefined');
			assert.equal('Dresden', room.memory.base.name);
			
			var manager = new BaseManager(room);
			manager.allRoles = [ role ];
			manager.initBaseRoleConfigIfNecessary();

			spawn.room.memory.base.roleConfig = { Role :  { requiredNumber : 42 } };
			
			manager.initBaseRoleConfigIfNecessary();

			assert.equal(true, typeof room.memory.base.roleConfig !== 'undefined');
			assert.equal(true, typeof room.memory.base.roleConfig['Role'] !== 'undefined');
			assert.equal(42, room.memory.base.roleConfig['Role'].requiredNumber);
		});
	});
});
