var MemoryManager = require('../src/manager.memory');
var assert = require('assert');

var game = require('../src/main.game');
var memory = require('./mock/memory-mock');

var Room = require('./mock/room-mock');
var Spawn = require('./mock/spawn-mock');

// All methods tested.

describe('manager.memory', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	});
	
	it('exists', () => {
		var startsWith = 'class MemoryManager';
		assert.equal(startsWith, MemoryManager.toString().substring(0, startsWith.length));
	});

	describe('#fetchRoomRoleConfig', () => {
		it('no memory', () => {
			var room = new Room();
			room.memory.base = {};
	
			var role = { roleName: 'Role' };
			
			var result = MemoryManager._fetchRoomRoleConfig(room, [ role ]);
			
			var expecting = {
				partsMinMultiplier: 0,
				partsMaxMultiplier: 5,
				showIcons: true,
		    	useStorageAsSource: true,
		    	useSourceAsSource: true,
				Role: {
					requiredNumber: 0,
				}
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.base.roleConfig);
		});
		
		it('some memory', () => {
			var room = new Room();
			room.memory.base = {};
			room.memory.base.roleConfig =  {
				Role1: {
					requiredNumber: 1,
				},
			};
	
			var role1 = { roleName: 'Role1' };
			var role2 = { roleName: 'Role2' };
			
			var result = MemoryManager._fetchRoomRoleConfig(room, [ role1, role2 ]);
			
			var expecting = {
				partsMinMultiplier: 0,
				partsMaxMultiplier: 5,
				showIcons: true,
		    	useStorageAsSource: true,
		    	useSourceAsSource: true,
				Role1: {
					requiredNumber: 1,
				},
				Role2: {
					requiredNumber: 0,
				},
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.base.roleConfig);
		});
		
		it('memory present', () => {
			var room = new Room();
			room.memory.base = {};
			room.memory.base.roleConfig =  {
					partsMinMultiplier: 3,
					partsMaxMultiplier: 3,
					showIcons: false,
			    	useStorageAsSource: false,
			    	useSourceAsSource: false,
				Role1: {
					requiredNumber: 1,
				},
				Role2: {
					requiredNumber: 0,
				},
			};
	
			var role1 = { roleName: 'Role1' };
			var role2 = { roleName: 'Role2' };
			
			var result = MemoryManager._fetchRoomRoleConfig(room, [ role1, role2 ]);
			
			var expecting = {
				partsMinMultiplier: 3,
				partsMaxMultiplier: 3,
				showIcons: false,
		    	useStorageAsSource: false,
		    	useSourceAsSource: false,
				Role1: {
					requiredNumber: 1,
				},
				Role2: {
					requiredNumber: 0,
				},
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.base.roleConfig);
		});
	});

	describe('#fetchAllRoomRoleConfig', () => {
		it('no memory', () => {
			var room1 = new Room();
			room1.memory.base = {};

			var room2 = new Room();
			room2.memory.base = {};
	
			var role = { roleName: 'Role' };
			
			game.findAllRooms = () => [ room1, room2 ];
			MemoryManager._fetchAllRoomRoleConfigs([ role ]);
			
			var expecting = {
				partsMinMultiplier: 0,
				partsMaxMultiplier: 5,
				showIcons: true,
		    	useStorageAsSource: true,
		    	useSourceAsSource: true,
				Role: {
					requiredNumber: 0,
				}
			};
			
			assert.deepEqual(expecting, room1.memory.base.roleConfig);
			assert.deepEqual(expecting, room2.memory.base.roleConfig);
		});
		
		it('some memory', () => {
			var room1 = new Room();
			room1.memory.base = {};
			room1.memory.base.roleConfig =  {
		    	useStorageAsSource: false,
				Role1: {
					requiredNumber: 1,
				},
			};

			var room2 = new Room();
			room2.memory.base = {};
			room2.memory.base.roleConfig =  {
		    	useStorageAsSource: false,
		    	useSourceAsSource: true,
				Role1: {
					requiredNumber: 1,
				},
				Role2: {
					requiredNumber: 0,
				},
			};
	
			var role1 = { roleName: 'Role1' };
			var role2 = { roleName: 'Role2' };

			game.findAllRooms = () => [ room1, room2 ];
			MemoryManager._fetchAllRoomRoleConfigs([ role1, role2 ]);
			
			var expecting = {
				partsMinMultiplier: 0,
				partsMaxMultiplier: 5,
				showIcons: true,
		    	useStorageAsSource: false,
		    	useSourceAsSource: true,
				Role1: {
					requiredNumber: 1,
				},
				Role2: {
					requiredNumber: 0,
				},
			};
			
			assert.deepEqual(expecting, room1.memory.base.roleConfig);
			assert.deepEqual(expecting, room2.memory.base.roleConfig);
		});
		
		it('memory present', () => {
			var room1 = new Room();
			room1.memory.base = {};
			room1.memory.base.roleConfig =  {
				partsMinMultiplier: 1,
				partsMaxMultiplier: 2,
				showIcons: false,
		    	useStorageAsSource: true,
		    	useSourceAsSource: true,
				Role1: {
					requiredNumber: 1,
				},
				Role2: {
					requiredNumber: 0,
				},
			};

			var room2 = new Room();
			room2.memory.base = {};
			room2.memory.base.roleConfig =  {
				partsMinMultiplier: 1,
				partsMaxMultiplier: 2,
				showIcons: false,
		    	useStorageAsSource: true,
		    	useSourceAsSource: true,
				Role1: {
					requiredNumber: 1,
				},
				Role2: {
					requiredNumber: 0,
				},
			};
	
			var role1 = { roleName: 'Role1' };
			var role2 = { roleName: 'Role2' };

			game.findAllRooms = () => [ room1, room2 ];
			MemoryManager._fetchAllRoomRoleConfigs([ role1, role2 ]);
			
			var expecting = {
				partsMinMultiplier: 1,
				partsMaxMultiplier: 2,
				showIcons: false,
		    	useStorageAsSource: true,
		    	useSourceAsSource: true,
				Role1: {
					requiredNumber: 1,
				},
				Role2: {
					requiredNumber: 0,
				},
			};
			
			assert.deepEqual(expecting, room1.memory.base.roleConfig);
			assert.deepEqual(expecting, room2.memory.base.roleConfig);
		});
	});

	describe('#clearRoomRoleInfo', () => {
		it('no memory', () => {
			var room = new Room();
	
			var role = { 
				symbol: '!',
				roleName: 'Role', 
			};
			
			var result = MemoryManager._clearRoomRoleInfo(room, [ role ]);
			
			var expecting = {
				Role: {
					symbol: '!',
					currentNumber: 0,
					requiredNumber: -1,
				}
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.roleInfo);
		});
		
		it('memory present', () => {
			var room = new Room();
			room.memory.base = {};
			room.memory.base.roleConfig =  {
				Role1: {
					requiredNumber: 1,
				},
				Role2: {
					requiredNumber: 0,
				},
			};
	
			var role1 = { 
				symbol: '!',
				roleName: 'Role1' 
			};
			var role2 = { 
				symbol: '?',
				roleName: 'Role2' 
			};
			
			var result = MemoryManager._clearRoomRoleInfo(room, [ role1, role2 ]);
			
			var expecting = {
				Role1: {
					symbol: '!',
					currentNumber: 0,
					requiredNumber: 1,
				},
				Role2: {
					symbol: '?',
					currentNumber: 0,
					requiredNumber: 0,
				},
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.roleInfo);
		});
	});
	

	describe('#clearAllRoomRoleInfos', () => {
		it('no memory', () => {
			var room1 = new Room();
			var room2 = new Room();
	
			var role = { 
				symbol: '!',
				roleName: 'Role', 
			};
			
			game.findAllRooms = () => [ room1, room2 ];
			MemoryManager._clearAllRoomRoleInfos( [ role ]);
			
			var expecting = {
				Role: {
					symbol: '!',
					currentNumber: 0,
					requiredNumber: -1,
				}
			};
			
			assert.deepEqual(expecting, room1.memory.roleInfo);
			assert.deepEqual(expecting, room2.memory.roleInfo);
		});
		
		it('memory present', () => {
			var room1 = new Room();
			room1.memory.base = {};
			room1.memory.base.roleConfig =  {
				Role1: {
					requiredNumber: 3,
				},
				Role2: {
					requiredNumber: 0,
				},
			};

			var room2 = new Room();
			room2.memory.base = {};
			room2.memory.base.roleConfig =  {
				Role1: {
					requiredNumber: 3,
				},
			};
	
			var role1 = { 
				symbol: '!',
				roleName: 'Role1' 
			};
			var role2 = { 
				symbol: '?',
				roleName: 'Role2' 
			};

			game.findAllRooms = () => [ room1, room2 ];
			var result = MemoryManager._clearAllRoomRoleInfos([ role1, role2 ]);
			
			var expecting = {
				Role1: {
					symbol: '!',
					currentNumber: 0,
					requiredNumber: 3,
				},
				Role2: {
					symbol: '?',
					currentNumber: 0,
					requiredNumber: 0,
				},
			};
			
			assert.deepEqual(expecting, room1.memory.roleInfo);
			assert.deepEqual(expecting, room2.memory.roleInfo);
		});
	});
	
	describe('#getRequiredNumberForRoomAndRole', () => {
		it('not defined no base', () => {
			var role = {};
			role.roleName = 'Role';
			
			var room = new Room();
			
			assert.equal(-1, MemoryManager.getRequiredNumberForRoomAndRole(room, role.roleName));
		});

		it('not defined but base', () => {
			var role = {};
			role.roleName = 'Role';
			
			var room = new Room();
			room.memory.base = {};
			
			assert.equal(0, MemoryManager.getRequiredNumberForRoomAndRole(room, role.roleName));
		});

		it('defined in base', () => {
			var role = {};
			role.roleName = 'Role';
			
			var room = new Room();
			room.memory.base = { roleConfig : { Role :  { requiredNumber : 1 } } };
			
			assert.equal(1, MemoryManager.getRequiredNumberForRoomAndRole(room, role.roleName));
		});
	});

	describe('#fetchRoomBase', () => {
		it('no memory', () => {
			var room = new Room();
	
			var role = { roleName: 'Role' };
			
			var result = MemoryManager.fetchRoomBase(room, 'Dresden');
			
			var expecting = {
				name: 'Dresden',
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.base);
		});
		
		it('some memory', () => {
			var room = new Room();
			room.memory.base = {};
	
			var role1 = { roleName: 'Role1' };
			var role2 = { roleName: 'Role2' };

			var result = MemoryManager.fetchRoomBase(room, 'Leipzig');
			
			var expecting = {
				name: 'Leipzig',
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.base);
		});
		
		it('memory present', () => {
			var room = new Room();
			room.memory.base = {
				name: 'Chemnitz',
			};
	
			var role1 = { roleName: 'Role1' };
			var role2 = { roleName: 'Role2' };

			var result = MemoryManager.fetchRoomBase(room, 'Görlitz');
			
			var expecting = {
				name: 'Chemnitz',
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.base);
		});
	});

	describe('#initSpawns', () => {
		it('init spawn without base', () => {
			var room = new Room();
	
			var spawn = new Spawn(room);
			spawn.name = 'Dresden';
			
			MemoryManager._initSpawns();

			var expecting = {
				name: 'Dresden',
			};
			
			assert.equal('Dresden', spawn.memory.home);
			assert.deepEqual(expecting, spawn.room.memory.base);
			assert.deepEqual(expecting, room.memory.base);
		});

		it('init spawn with base', () => {
			var room = new Room();
			room.memory.base = {
				name: 'Chemnitz'
			};
	
			var spawn = new Spawn(room);
			spawn.name = 'Dresden';
			
			MemoryManager._initSpawns();

			var expecting = {
				name: 'Chemnitz',
			};
			
			assert.equal('Chemnitz', spawn.memory.home);
			assert.deepEqual(expecting, spawn.room.memory.base);
			assert.deepEqual(expecting, room.memory.base);
		});
	});

	describe('#fetchRoomRoleConfigForBase', () => {
		it('found base', () => {
			var room1 = new Room();
			var room2 = new Room();
			var room3 = new Room();
			MemoryManager.fetchRoomBase(room2, 'New York');
			var roleConfig = MemoryManager._fetchRoomRoleConfig(room2, [ { roleName: 'Role' } ]);
			
			game.findAllRooms = () => [ room1, room2, room3 ];
			assert.deepEqual(roleConfig, MemoryManager.fetchRoomRoleConfigForBase('New York'));
		});

		it('no base', () => {
			var room1 = new Room();
			var room2 = new Room();
			var room3 = new Room();

			game.findAllRooms = () => [ room1, room2, room3 ];
			assert.equal(null, MemoryManager.fetchRoomRoleConfigForBase('New York'));
		});
	});
});
