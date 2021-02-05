var GcManager = require('../src/manager.cpu');
var assert = require('assert');

var Room = require('./mock/room-mock');

// All methods tested.

describe('manager.cpu', () => {
	beforeEach(() => {
		Game.clearAll();
		GcManager.initRound();
	});
	
	it('exists', () => {
		var startsWith = 'class GcManager';
		assert.equal(startsWith, GcManager.toString().substring(0, startsWith.length));
	});
	
	describe('#fetchMemoryOfRoomCpu', () => {
		it('no memory', () => {
			var room = new Room();
	
			var result = GcManager._fetchMemoryOfRoomCpu(room);
			
			var expecting = {
				x: 20,
				y: 0,
				opacity: 0.5,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.cpu);
		});

		it('some memory', () => {
			var room = new Room();
			room.memory.cpu = {
				x: 13,
			};
	
			var result = GcManager._fetchMemoryOfRoomCpu(room);

			var expecting = {
				x: 13,
				y: 0,
				opacity: 0.5,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.cpu);
		});

		it('memory present', () => {
			var room = new Room();
			room.memory.cpu = {
				x: 13,
				y: 42,
				opacity: 1,
			};
	
			var result = GcManager._fetchMemoryOfRoomCpu(room);
			
			var expecting = {
				x: 13,
				y: 42,
				opacity: 1,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.cpu);
		});
	});

	describe('#measure', () => {
		it('simple', () => {
			var cpu = 5;
			Game.cpu = {};
			Game.cpu.getUsed = () => cpu;
			
			var called = false;
			GcManager.measure('A', () => {
				cpu++;
				called = true;
			});

			assert.equal(GcManager._measurements.length, 1);
			assert.equal(GcManager._measurements[0].name, 'A');
			assert.equal(GcManager._measurements[0].usedTicks, 1);
			assert.equal(6, cpu);
		});
	});

	describe('#initRound', () => {
		it('simple', () => {
			var cpu = 5;
			Game.cpu.getUsed = () => cpu;
			GcManager.measure('A', () => cpu++ );

			assert.equal(GcManager._measurements.length, 1);
			
			GcManager.initRound();

			assert.equal(GcManager._measurements.length, 0);
		});
	});

	describe('#_visualizeMeasurements', () => {
		it('completely empty', () => {
			var room = new Room();
			
			GcManager._visualizeMeasurements(room);

			assert.notEqual(undefined, room.visual.elements);
			assert.equal('CPU Watcher', room.visual.elements[20][0]);
			assert.equal(null, room.visual.elements[20][1]);
		});
		
		it('no CPU coordinates', () => {
			var cpu = 5;
			Game.cpu.getUsed = () => cpu;
			GcManager.measure('A', () => cpu++ );

			var room = new Room();

			GcManager._visualizeMeasurements(room);

			assert.notEqual(undefined, room.visual.elements);
			assert.equal('CPU Watcher', room.visual.elements[20][0]);
			assert.equal('A', room.visual.elements[20][1]);
			assert.equal(null, room.visual.elements[20][2]);

			assert.equal(null, room.visual.elements[27][0]);
			assert.equal('1', room.visual.elements[27][1]);
			assert.equal(null, room.visual.elements[27][2]);
		});
		it('with CPU coordinates', () => {
			var cpu = 5;
			Game.cpu.getUsed = () => cpu;
			GcManager.measure('A', () => cpu++ );

			var room = new Room();
			room.memory.cpu = {
				x: 13,
				y: 42,
				opacity: 1,
			};

			GcManager._visualizeMeasurements(room);

			assert.notEqual(undefined, room.visual.elements);
			assert.equal('CPU Watcher', room.visual.elements[13][42]);
			assert.equal('A', room.visual.elements[13][43]);
			assert.equal(null, room.visual.elements[13][44]);

			assert.equal(null, room.visual.elements[20][42]);
			assert.equal('1', room.visual.elements[20][43]);
			assert.equal(null, room.visual.elements[20][44]);
		});
	});
});
