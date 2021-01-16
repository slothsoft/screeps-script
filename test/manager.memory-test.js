var MemoryManager = require('../src/manager.memory');
var assert = require('assert');

var Room = require('./mock/room-mock.js');

// All methods tested.

describe('manager.memory', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	});
	
	it('exists', () => {
		var startsWith = 'class MemoryManager';
		assert.equal(startsWith, MemoryManager.toString().substring(0, startsWith.length));
	});

	describe('#fetchRoomConsole', () => {
		it('no memory', () => {
			var room = new Room();
	
			var result = MemoryManager.fetchRoomConsole(room);
			
			var expecting = {
				x: 40,
				y: 0,
				height: 50,
				roleInfoX: 0,
				roleInfoY: 0,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.console);
		});

		it('some memory', () => {
			var room = new Room();
			room.memory.console = {
				x: 13,
				height: 0,
			};
	
			var result = MemoryManager.fetchRoomConsole(room);
			
			var expecting = {
				x: 13,
				y: 0,
				height: 0,
				roleInfoX: 0,
				roleInfoY: 0,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.console);
		});

		it('memory present', () => {
			var room = new Room();
			room.memory.console = {
				x: 13,
				y: 42,
				height: 10,
				roleInfoX: 99,
				roleInfoY: 10,
			};
	
			var result = MemoryManager.fetchRoomConsole(room);
			
			var expecting = {
				x: 13,
				y: 42,
				height: 10,
				roleInfoX: 99,
				roleInfoY: 10,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.console);
		});
	});

	describe('#fetchRoomRoleConfig', () => {
		it('no memory', () => {
			var room = new Room();
			room.memory.base = {};
	
			var role = { roleName: 'Role' };
			
			var result = MemoryManager.fetchRoomRoleConfig(room, [ role ]);
			
			var expecting = {
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
			
			var result = MemoryManager.fetchRoomRoleConfig(room, [ role1, role2 ]);
			
			var expecting = {
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
				Role1: {
					requiredNumber: 1,
				},
				Role2: {
					requiredNumber: 0,
				},
			};
	
			var role1 = { roleName: 'Role1' };
			var role2 = { roleName: 'Role2' };
			
			var result = MemoryManager.fetchRoomRoleConfig(room, [ role1, role2 ]);
			
			var expecting = {
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
});
