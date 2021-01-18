var classUnderTest = require('../src/main.info');
var assert = require('assert');

var MemoryManager = require('../src/manager.memory');
var Room = require('./mock/room-mock.js');

// All methods tested.

describe('main.info', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});

	describe('#getMaxHeight', () => {
		it('simple', () => {
			var room1 = new Room();
			MemoryManager.fetchRoomConsole(room1).height = 123;
			
			var room2 = new Room();
			MemoryManager.fetchRoomConsole(room2).height = 456;
			
			var room3 = new Room();
			MemoryManager.fetchRoomConsole(room3).height = 789;
			
			assert.equal(classUnderTest.getMaxHeight(), 789);
		});
	});

	describe('#log', () => {
		it('simple', () => {
			classUnderTest.clearLog();
			classUnderTest.log('A');
			classUnderTest.log('B');
			classUnderTest.log('C');

			assert.equal(classUnderTest.console.length, 3);
			assert.equal(classUnderTest.console[0].includes('C'), true);
			assert.equal(classUnderTest.console[1].includes('B'), true);
			assert.equal(classUnderTest.console[2].includes('A'), true);
		});

		it('reject over height', () => {
			classUnderTest.getMaxHeight = () => 2;
			
			classUnderTest.clearLog();
			classUnderTest.log('A');
			classUnderTest.log('B');
			classUnderTest.log('C');
			
			assert.equal(classUnderTest.console.length, 2);
			assert.equal(classUnderTest.console[0].includes('C'), true);
			assert.equal(classUnderTest.console[1].includes('B'), true);
		});
	});

	describe('#error', () => {
		it('simple', () => {
			classUnderTest.getMaxHeight = () => 3;
			classUnderTest.clearLog();
			
			classUnderTest.error('A');
			classUnderTest.error('B');
			classUnderTest.error('C');

			assert.equal(classUnderTest.console.length, 3);
			assert.equal(classUnderTest.console[0].includes('🛑 C'), true);
			assert.equal(classUnderTest.console[1].includes('🛑 B'), true);
			assert.equal(classUnderTest.console[2].includes('🛑 A'), true);
		});
	});

	describe('#warning', () => {
		it('simple', () => {
			classUnderTest.getMaxHeight = () => 3;
			classUnderTest.clearLog();
			
			classUnderTest.warning('A');
			classUnderTest.warning('B');
			classUnderTest.warning('C');

			assert.equal(classUnderTest.console.length, 3);
			assert.equal(classUnderTest.console[0].includes('⚠ C'), true);
			assert.equal(classUnderTest.console[1].includes('⚠ B'), true);
			assert.equal(classUnderTest.console[2].includes('⚠ A'), true);
		});
	});

	describe('#clearLog', () => {
		it('simple', () => {
			classUnderTest.log('A');
			classUnderTest.log('B');
			classUnderTest.log('C');

			classUnderTest.clearLog();

			assert.equal(classUnderTest.console.length, 0);
		});
	});

	describe('#printRolesInfoForRoom', () => {
		it('no roleInfo coordinates', () => {
			
			var room = new Room();
			
			classUnderTest.printRolesInfoForRoom(room);
			
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
			
			classUnderTest.printRolesInfoForRoom(room);

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
			classUnderTest.printRolesInfoForRoom(room);

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
			classUnderTest.printRolesInfoForRoom(room);

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
			classUnderTest.printRolesInfoForRoom(room);

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
			classUnderTest.printRolesInfoForRoom(room);

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
			classUnderTest.printRolesInfoForRoom(room);

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
			classUnderTest.printRolesInfoForRoom(room);

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
			
			classUnderTest.printRolesInfoForRoom(room);

			assert.notEqual(undefined, room.visual.elements);
			assert.equal('Hello World    4/10🟡', room.visual.elements[0][0]);
			assert.equal(null, room.visual.elements[0][1]);
		});
	});
});
