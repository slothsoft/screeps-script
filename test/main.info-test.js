var classUnderTest = require('../src/main.info');
var assert = require('assert');

var MemoryManager = require('../src/manager.memory');
var Room = require('./mock/room-mock');

// All methods tested.

describe('main.info', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});

	describe('#fetchMemoryOfRoomConsole', () => {
		it('no memory', () => {
			var room = new Room();
	
			var result = classUnderTest.fetchMemoryOfRoomConsole(room);
			
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
	
			var result = classUnderTest.fetchMemoryOfRoomConsole(room);
			
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
	
			var result = classUnderTest.fetchMemoryOfRoomConsole(room);
			
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
			classUnderTest.fetchMemoryOfRoomConsole(room1).height = 123;
			
			var room2 = new Room();
			classUnderTest.fetchMemoryOfRoomConsole(room2).height = 456;
			
			var room3 = new Room();
			classUnderTest.fetchMemoryOfRoomConsole(room3).height = 789;
			
			assert.equal(classUnderTest.getMaxHeight(), 789);
		});
	});

	describe('#log', () => {
		it('simple', () => {
			classUnderTest.clearLines();
			classUnderTest.log('A');
			classUnderTest.log('B');
			classUnderTest.log('C');

			assert.equal(classUnderTest.getLines().length, 3);
			assert.equal(classUnderTest.getLine(0).includes('C'), true);
			assert.equal(classUnderTest.getLine(1).includes('B'), true);
			assert.equal(classUnderTest.getLine(2).includes('A'), true);
		});

		it('reject over height', () => {
			classUnderTest.getMaxHeight = () => 2;
			
			classUnderTest.clearLines();
			classUnderTest.log('A');
			classUnderTest.log('B');
			classUnderTest.log('C');
			
			assert.equal(classUnderTest.getLines().length, 2);
			assert.equal(classUnderTest.getLine(0).includes('C'), true);
			assert.equal(classUnderTest.getLine(1).includes('B'), true);
		});
	});

	describe('#error', () => {
		it('simple', () => {
			classUnderTest.getMaxHeight = () => 3;
			classUnderTest.clearLines();
			
			classUnderTest.error('A');
			classUnderTest.error('B');
			classUnderTest.error('C');

			assert.equal(classUnderTest.getLines().length, 3);
			assert.equal(classUnderTest.getLine(0).includes('🛑 C'), true);
			assert.equal(classUnderTest.getLine(1).includes('🛑 B'), true);
			assert.equal(classUnderTest.getLine(2).includes('🛑 A'), true);
		});
	});

	describe('#warning', () => {
		it('simple', () => {
			classUnderTest.getMaxHeight = () => 3;
			classUnderTest.clearLines();
			
			classUnderTest.warning('A');
			classUnderTest.warning('B');
			classUnderTest.warning('C');

			assert.equal(classUnderTest.getLines().length, 3);
			assert.equal(classUnderTest.getLine(0).includes('⚠ C'), true);
			assert.equal(classUnderTest.getLine(1).includes('⚠ B'), true);
			assert.equal(classUnderTest.getLine(2).includes('⚠ A'), true);
		});
	});

	describe('#clearLog', () => {
		it('simple', () => {
			classUnderTest.log('A');
			classUnderTest.log('B');
			classUnderTest.log('C');

			classUnderTest.clearLines();

			assert.equal(classUnderTest.getLines().length, 0);
		});
	});

	describe('#_visualizeRoleInfos', () => {
		it('no roleInfo coordinates', () => {
			
			var room = new Room();
			
			classUnderTest._visualizeRoleInfos(room);
			
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
			
			classUnderTest._visualizeRoleInfos(room);

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
			classUnderTest._visualizeRoleInfos(room);

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
			classUnderTest._visualizeRoleInfos(room);

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
			classUnderTest._visualizeRoleInfos(room);

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
			classUnderTest._visualizeRoleInfos(room);

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
			classUnderTest._visualizeRoleInfos(room);

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
			classUnderTest._visualizeRoleInfos(room);

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
			
			classUnderTest._visualizeRoleInfos(room);

			assert.notEqual(undefined, room.visual.elements);
			assert.equal('Hello World    4/10🟡', room.visual.elements[0][0]);
			assert.equal(null, room.visual.elements[0][1]);
		});
	});
});
