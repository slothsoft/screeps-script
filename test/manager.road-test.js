var RoadManager = require('../src/manager.road');
var assert = require('assert');

var Creep = require('./mock/creep-mock.js');
var Room = require('./mock/room-mock.js');

// All methods tested.

describe('manager.road', () => {
	it('constructor', () => {
		var startsWith = 'class RoadManager';
		assert.equal(startsWith, RoadManager.toString().substring(0, startsWith.length));
	});

	describe('#fetchMemoryOfWatcher', () => {
		it('no memory', () => {
			var room = new Room();
	
			var result = new RoadManager(room).fetchMemoryOfWatcher();
			
			var expecting = {
				enabled: true,
				watchTime: 1000,
				visualize: false,
				tick: 0,
				threshold: 100,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.roadManager);
		});

		it('some memory', () => {
			var room = new Room();
			room.memory.roadManager = {
				watchTime: 0,
			};
	
			var result = new RoadManager(room).fetchMemoryOfWatcher();
			
			var expecting = {
				enabled: true,
				watchTime: 0,
				visualize: false,
				tick: 0,
				threshold: 100,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.roadManager);
		});

		it('memory present', () => {
			var room = new Room();
			room.memory.roadManager = {
				enabled: false,
				watchTime: 55,
				visualize: true,
				tick: 70,
				threshold: 99,
			};
	
			var result = new RoadManager(room).fetchMemoryOfWatcher();
			
			var expecting = {
				enabled: false,
				watchTime: 55,
				visualize: true,
				tick: 70,
				threshold: 99,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.roadManager);
		});
	});

	describe('#watchRoom', () => {
		it('lifecycle', () => {
			var room = new Room();
			room.find = type => {
				var creep = new Creep(room);
				creep.pos.x = 12;
				creep.pos.y = 34;
				return [ creep ];
			};
	
			var watcher = new RoadManager(room);
			watcher.fetchMemoryOfWatcher().watchTime = 3;

			// first tick
			
			watcher.watchRoom();

			assert.equal(1, watcher.fetchMemoryOfWatcher().tick);
			
			var array = watcher.createTileArray(watcher.fetchMemoryOfWatcher().currentTiles);
			for (var x = 0; x < 50; x++) {
				for (var y = 0; y < 50; y++) {
					if (x == 12 && y == 34) {
						assert.equal(1, array.get(x, y));
					} else {
						assert.equal('', array.get(x, y));
					}
				}
			}
			assert.equal(true, watcher.fetchMemoryOfWatcher().lastTiles === undefined);

			// second tick
			
			watcher.watchRoom();

			assert.equal(2, watcher.fetchMemoryOfWatcher().tick);
			
			var array = watcher.createTileArray(watcher.fetchMemoryOfWatcher().currentTiles);
			for (var x = 0; x < 50; x++) {
				for (var y = 0; y < 50; y++) {
					if (x == 12 && y == 34) {
						assert.equal(2, array.get(x, y));
					} else {
						assert.equal('', array.get(x, y));
					}
				}
			}
			assert.equal(true, watcher.fetchMemoryOfWatcher().lastTiles === undefined);

			// third tick
			
			watcher.watchRoom();

			assert.equal(3, watcher.fetchMemoryOfWatcher().tick);
			
			var array = watcher.createTileArray(watcher.fetchMemoryOfWatcher().currentTiles);
			for (var x = 0; x < 50; x++) {
				for (var y = 0; y < 50; y++) {
					if (x == 12 && y == 34) {
						assert.equal(3, array.get(x, y));
					} else {
						assert.equal('', array.get(x, y));
					}
				}
			}
			assert.equal(true, watcher.fetchMemoryOfWatcher().lastTiles === undefined);

			// fourth tick
			
			watcher.watchRoom();

			assert.equal(0, watcher.fetchMemoryOfWatcher().tick);
			
			var array = watcher.createTileArray(watcher.fetchMemoryOfWatcher().currentTiles);
			for (var x = 0; x < 50; x++) {
				for (var y = 0; y < 50; y++) {
					if (x == 12 && y == 34) {
						assert.equal(1, array.get(x, y));
					} else {
						assert.equal('', array.get(x, y));
					}
				}
			}

			var array = watcher.createTileArray(watcher.fetchMemoryOfWatcher().lastTiles);
			for (var x = 0; x < 50; x++) {
				for (var y = 0; y < 50; y++) {
					if (x == 12 && y == 34) {
						assert.equal(3, array.get(x, y));
					} else {
						assert.equal('', array.get(x, y));
					}
				}
			}
		});

		it('not enabled', () => {
			var room = new Room();
			room.find = type => {
				var creep = new Creep(room);
				creep.pos.x = 12;
				creep.pos.y = 34;
				return [ creep ];
			};
	
			var watcher = new RoadManager(room);
			watcher.fetchMemoryOfWatcher().enabled = false;

			// first tick
			
			watcher.watchRoom();

			assert.equal(0, watcher.fetchMemoryOfWatcher().tick);
			
			var array = watcher.createTileArray(watcher.fetchMemoryOfWatcher().currentTiles);
			for (var x = 0; x < 50; x++) {
				for (var y = 0; y < 50; y++) {
					assert.equal(undefined, array.get(x, y));
				}
			}
			assert.equal(true, watcher.fetchMemoryOfWatcher().lastTiles === undefined);
		});
	});
	
	describe('#fetchPositionsOverThreshold', () => {
		it('empty', () => {
			var room = new Room();
	
			var watcher = new RoadManager(room);
			var memory = watcher.fetchMemoryOfWatcher();
			
			var positions = watcher.fetchPositionsOverThreshold();
			assert.deepEqual([], positions);
		});
		
		it('single', () => {
			var room = new Room();
	
			var watcher = new RoadManager(room);
			var memory = watcher.fetchMemoryOfWatcher();
			
			var array = watcher.createTileArray(memory.lastTiles);
			array.set(12, 34, 567);
			memory.lastTiles = array.toCompactString();

			var positions = watcher.fetchPositionsOverThreshold();
			assert.deepEqual([ {
				x: 12,
				y: 34,
				value: 567,
			}], positions);
		});

		it('multiple', () => {
			var room = new Room();
	
			var watcher = new RoadManager(room);
			var memory = watcher.fetchMemoryOfWatcher();
			
			var array = watcher.createTileArray(memory.lastTiles);
			array.set(1, 2, 300);
			array.set(12, 34, 567);
			array.set(23, 45, 678);
			memory.lastTiles = array.toCompactString();

			var positions = watcher.fetchPositionsOverThreshold();
			assert.deepEqual([ {
				x: 23,
				y: 45,
				value: 678,
			}, {
				x: 12,
				y: 34,
				value: 567,
			}, {
				x: 1,
				y: 2,
				value: 300,
			}], positions);
		});


		it('with threshold', () => {
			var room = new Room();
	
			var watcher = new RoadManager(room);
			var memory = watcher.fetchMemoryOfWatcher();
			
			var array = watcher.createTileArray(memory.lastTiles);
			array.set(1, 2, 3);
			array.set(12, 34, 567);
			array.set(23, 45, 678);
			memory.lastTiles = array.toCompactString();

			var positions = watcher.fetchPositionsOverThreshold();
			assert.deepEqual([ {
				x: 23,
				y: 45,
				value: 678,
			}, {
				x: 12,
				y: 34,
				value: 567,
			}], positions);

			room.memory.roadManager.threshold = 0;
			positions = watcher.fetchPositionsOverThreshold();
			assert.deepEqual([ {
				x: 23,
				y: 45,
				value: 678,
			}, {
				x: 12,
				y: 34,
				value: 567,
			}, {
				x: 1,
				y: 2,
				value: 3,
			}], positions);

			room.memory.roadManager.threshold = 678;
			positions = watcher.fetchPositionsOverThreshold();
			assert.deepEqual([ {
				x: 23,
				y: 45,
				value: 678,
			}], positions);
		});
	});
});