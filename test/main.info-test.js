var MainInfo = require('../src/main.info');
var assert = require('assert');

var MainUtil = require('../src/main.util');

var MemoryManager = require('../src/manager.memory');
var Room = require('./mock/room-mock');

// All methods tested.

describe('main.info', () => {
	beforeEach(() => {
		Game.clearAll();
		MainInfo.clearLines();
	});
	
	it('exists', () => {
		var startsWith = 'class MainInfo';
		assert.equal(startsWith, MainInfo.toString().substring(0, startsWith.length));
	});

	describe('#_fetchMemoryOfRoomConsole', () => {
		it('no memory', () => {
			var room = new Room();
	
			var result = MainInfo._fetchMemoryOfRoomConsole(room);
			
			var expecting = {
				x: 30,
				y: 0,
				height: 49,
				roleInfoX: 0,
				roleInfoY: 0,
				opacity: 0.8,
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
	
			var result = MainInfo._fetchMemoryOfRoomConsole(room);
			
			var expecting = {
				x: 13,
				y: 0,
				height: 0,
				roleInfoX: 0,
				roleInfoY: 0,
				opacity: 0.8,
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
	
			var result = MainInfo._fetchMemoryOfRoomConsole(room);
			
			var expecting = {
				x: 13,
				y: 42,
				height: 10,
				roleInfoX: 99,
				roleInfoY: 10,
				opacity: 0.8,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.console);
		});
	});

	describe('#getMaxHeight', () => {
		it('simple', () => {
			var room1 = new Room();
			MainInfo._fetchMemoryOfRoomConsole(room1).height = 123;
			
			var room2 = new Room();
			MainInfo._fetchMemoryOfRoomConsole(room2).height = 456;
			
			var room3 = new Room();
			MainInfo._fetchMemoryOfRoomConsole(room3).height = 789;
			
			assert.equal(MainInfo.getMaxHeight(), 789);
		});
	});

	describe('#log', () => {
		it('simple', () => {
			MainInfo.log('A');
			MainInfo.log('B');
			MainInfo.log('C');

			assert.equal(MainInfo.getLines().length, 3);
			assert.equal(MainInfo.getLine(0).includes('C'), true);
			assert.equal(MainInfo.getLine(1).includes('B'), true);
			assert.equal(MainInfo.getLine(2).includes('A'), true);
		});

		it('reject over height', () => {
			MainInfo.getMaxHeight = () => 2;
			
			MainInfo.log('A');
			MainInfo.log('B');
			MainInfo.log('C');
			
			assert.equal(MainInfo.getLines().length, 2);
			assert.equal(MainInfo.getLine(0).includes('C'), true);
			assert.equal(MainInfo.getLine(1).includes('B'), true);
		});
	});

	describe('#error', () => {
		it('simple', () => {
			MainInfo.getMaxHeight = () => 3;
			
			MainInfo.error('A');
			MainInfo.error('B');
			MainInfo.error('C');

			assert.equal(MainInfo.getLines().length, 3);
			assert.equal(MainInfo.getLine(0).includes('🛑 C'), true);
			assert.equal(MainInfo.getLine(1).includes('🛑 B'), true);
			assert.equal(MainInfo.getLine(2).includes('🛑 A'), true);
		});
	});

	describe('#warning', () => {
		it('simple', () => {
			MainInfo.getMaxHeight = () => 3;
			
			MainInfo.warning('A');
			MainInfo.warning('B');
			MainInfo.warning('C');

			assert.equal(MainInfo.getLines().length, 3);
			assert.equal(MainInfo.getLine(0).includes('⚠ C'), true);
			assert.equal(MainInfo.getLine(1).includes('⚠ B'), true);
			assert.equal(MainInfo.getLine(2).includes('⚠ A'), true);
		});
	});

	describe('#clearLines', () => {
		it('simple', () => {
			MainInfo.log('A');
			MainInfo.log('B');
			MainInfo.log('C');

			MainInfo.clearLines();

			assert.equal(MainInfo.getLines().length, 0);
		});
	});

	describe('#_visualizeRoleInfos', () => {
		it('no roleInfo coordinates', () => {
			
			var room = new Room();
			
			MainInfo._visualizeRoleInfos(room);
			
			assert.equal(undefined, room.visual.elements);
		});
		it('no roleInfo roles', () => {

			var room = new Room();
			room.energyAvailable = 4;
			room.energyCapacityAvailable = 10;
			room.memory.base = {
				name: 'Hello World',
			};
			room.memory.roleInfo = {
					
			};
			
			MainInfo._visualizeRoleInfos(room);

			assert.notEqual(undefined, room.visual.elements);
			assert.equal('Hello World    4/10🟡', room.visual.elements[0][0]);
			assert.equal(null, room.visual.elements[0][1]);
		});
		it('current and required', () => {

			var room = new Room();
			room.energyAvailable = 4;
			room.energyCapacityAvailable = 10;
			room.memory.base = {
				name: 'Hello World',
			};
			room.memory.roleInfo = {
				Role: {
					symbol: '!',
					currentNumber: 1,
					requiredNumber: 2,
				}
			};
			MainInfo._visualizeRoleInfos(room);

			assert.notEqual(undefined, room.visual.elements);
			assert.equal('Hello World    4/10🟡', room.visual.elements[0][0]);
			assert.equal('! Role 1/2', room.visual.elements[0][1]);
			assert.equal(null, room.visual.elements[0][2]);
		});
		it('current and no required', () => {

			var room = new Room();
			room.energyAvailable = 4;
			room.energyCapacityAvailable = 10;
			room.memory.base = {
				name: 'Hello World',
			};
			room.memory.roleInfo = {
				Role: {
					symbol: '!',
					currentNumber: 1,
					requiredNumber: 0,
				}
			};
			MainInfo._visualizeRoleInfos(room);

			assert.notEqual(undefined, room.visual.elements);
			assert.equal('Hello World    4/10🟡', room.visual.elements[0][0]);
			assert.equal('! Role 1/0', room.visual.elements[0][1]);
			assert.equal(null, room.visual.elements[0][2]);
		});
		it('no current and required', () => {

			var room = new Room();
			room.energyAvailable = 4;
			room.energyCapacityAvailable = 10;
			room.memory.base = {
				name: 'Hello World',
			};
			room.memory.roleInfo = {
				Role: {
					symbol: '!',
					currentNumber: 0,
					requiredNumber: 2,
				}
			};
			MainInfo._visualizeRoleInfos(room);

			assert.notEqual(undefined, room.visual.elements);
			assert.equal('Hello World    4/10🟡', room.visual.elements[0][0]);
			assert.equal('! Role 0/2', room.visual.elements[0][1]);
			assert.equal(null, room.visual.elements[0][2]);
		});
		it('no current and no required', () => {

			var room = new Room();
			room.energyAvailable = 4;
			room.energyCapacityAvailable = 10;
			room.memory.base = {
				name: 'Hello World',
			};
			room.memory.roleInfo = {
				Role: {
					symbol: '!',
					currentNumber: 0,
					requiredNumber: 0,
				}
			};
			MainInfo._visualizeRoleInfos(room);

			assert.notEqual(undefined, room.visual.elements);
			assert.equal('Hello World    4/10🟡', room.visual.elements[0][0]);
			assert.equal('! 0/0', room.visual.elements[0][1]);
			assert.equal(null, room.visual.elements[0][2]);
		});
		it('current and no required because no base', () => {

			var room = new Room();
			room.energyAvailable = 4;
			room.energyCapacityAvailable = 10;
			room.memory.base = {
				name: 'Hello World',
			};
			room.memory.roleInfo = {
				Role: {
					symbol: '!',
					currentNumber: 1,
					requiredNumber: -1, // <--
				}
			};
			MainInfo._visualizeRoleInfos(room);

			assert.notEqual(undefined, room.visual.elements);
			assert.equal('Hello World    4/10🟡', room.visual.elements[0][0]);
			assert.equal('! Role 1', room.visual.elements[0][1]);
			assert.equal(null, room.visual.elements[0][2]);
		});
		it('no current and no required because no base', () => {

			var room = new Room();
			room.energyAvailable = 4;
			room.energyCapacityAvailable = 10;
			room.name = 'Hello World';
			room.memory.roleInfo = {
				Role: {
					symbol: '!',
					currentNumber: 0,
					requiredNumber: -1, 
				}
			};
			MainInfo._visualizeRoleInfos(room);

			assert.notEqual(undefined, room.visual.elements);
			assert.equal('Hello World    4/10🟡', room.visual.elements[0][0]);
			assert.equal('! 0', room.visual.elements[0][1]);
			assert.equal(null, room.visual.elements[0][2]);
		});
		it('no base name', () => {

			var room = new Room();
			room.energyAvailable = 4;
			room.energyCapacityAvailable = 10;
			room.name = 'Hello World';
			room.memory.roleInfo = {
					
			};
			
			MainInfo._visualizeRoleInfos(room);

			assert.notEqual(undefined, room.visual.elements);
			assert.equal('Hello World    4/10🟡', room.visual.elements[0][0]);
			assert.equal(null, room.visual.elements[0][1]);
		});
	});


	describe('#visualizeConsole', () => {
		it('empty', () => {

			var room = new Room();
			MainUtil.findAllRooms = () => [ room ];

			MainInfo._visualizeConsole(room);

			assert.equal(undefined, room.visual.elements[35][48]);
			assert.equal('<no console entries>', room.visual.elements[35][49]);
		});

		it('log', () => {
			
			var room = new Room();
			MainUtil.findAllRooms = () => [ room ];

			MainInfo.log('A');
			MainInfo.log('B');
			MainInfo.log('C');
			MainInfo.log('D');
			
			MainInfo._visualizeConsole(room);

			assert.equal(undefined, room.visual.elements[35][46]);
			assert.equal('B', room.visual.elements[35][47]);
			assert.equal('C', room.visual.elements[35][48]);
			assert.equal('D', room.visual.elements[35][49]);
		});

		it('for room', () => {
			
			var room = new Room();
			var otherRoom = new Room();
			MainUtil.findAllRooms = () => [ room, otherRoom ];

			MainInfo.log('A');
			MainInfo.log('B', room);
			MainInfo.log('C', otherRoom);
			
			MainInfo._visualizeConsole(room);

			assert.equal(undefined, room.visual.elements[35][47]);
			assert.equal('A', room.visual.elements[35][48]);
			assert.equal('B', room.visual.elements[35][49]);

			MainInfo._visualizeConsole(otherRoom);

			assert.equal(undefined, otherRoom.visual.elements[35][47]);
			assert.equal('A', otherRoom.visual.elements[35][48]);
			assert.equal('C', otherRoom.visual.elements[35][49]);
		});
	});
});
