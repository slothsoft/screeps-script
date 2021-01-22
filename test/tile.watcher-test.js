var TileWatcher = require('../src/tile.watcher');
var assert = require('assert');

var Room = require('./mock/room-mock');

// All methods tested.

describe('tile.watcher', () => {
	it('constructor', () => {
		var startsWith = 'class TileWatcher';
		assert.equal(startsWith, TileWatcher.toString().substring(0, startsWith.length));
	});

	describe('#fetchMemoryOfWatcher', () => {
		it('no memory', () => {
			var room = new Room();
	
			var result = new TileWatcher('test', room)._fetchMemoryOfWatcher();
			
			var expecting = {
				enabled: true,
				watchTime: 1000,
				visualize: false,
				tick: 0,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.test);
		});

		it('some memory', () => {
			var room = new Room();
			room.memory.other = {
				watchTime: 0,
			};
	
			var result = new TileWatcher('other', room)._fetchMemoryOfWatcher();
			
			var expecting = {
				enabled: true,
				watchTime: 0,
				visualize: false,
				tick: 0,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.other);
		});

		it('memory present', () => {
			var room = new Room();
			room.memory.bean = {
				enabled: false,
				watchTime: 55,
				visualize: true,
				tick: 70,
			};
	
			var result = new TileWatcher('bean', room)._fetchMemoryOfWatcher();
			
			var expecting = {
				enabled: false,
				watchTime: 55,
				visualize: true,
				tick: 70,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.bean);
		});
	});

	describe('#watchRoom', () => {
		it('lifecycle', () => {
			var room = new Room();
	
			var watcher = new TileWatcher('test', room);
			watcher._fetchMemoryOfWatcher().watchTime = 3;
			watcher._watchRoomTiles = a => {
				var value = a.get(12, 34);
				a.set(12, 34, value ? (1 + parseInt(value)) : 1);
			};
			
			// first tick
			
			watcher.watchRoom();

			assert.equal(1, watcher._fetchMemoryOfWatcher().tick);
			
			var array = watcher._createTileArray(watcher._fetchMemoryOfWatcher().currentTiles);
			for (var x = 0; x < 50; x++) {
				for (var y = 0; y < 50; y++) {
					if (x == 12 && y == 34) {
						assert.equal(1, array.get(x, y));
					} else {
						assert.equal('', array.get(x, y));
					}
				}
			}
			assert.equal(true, watcher._fetchMemoryOfWatcher().lastTiles === undefined);

			// second tick
			
			watcher.watchRoom();

			assert.equal(2, watcher._fetchMemoryOfWatcher().tick);
			
			var array = watcher._createTileArray(watcher._fetchMemoryOfWatcher().currentTiles);
			for (var x = 0; x < 50; x++) {
				for (var y = 0; y < 50; y++) {
					if (x == 12 && y == 34) {
						assert.equal(2, array.get(x, y));
					} else {
						assert.equal('', array.get(x, y));
					}
				}
			}
			assert.equal(true, watcher._fetchMemoryOfWatcher().lastTiles === undefined);

			// third tick
			
			watcher.watchRoom();

			assert.equal(3, watcher._fetchMemoryOfWatcher().tick);
			
			var array = watcher._createTileArray(watcher._fetchMemoryOfWatcher().currentTiles);
			for (var x = 0; x < 50; x++) {
				for (var y = 0; y < 50; y++) {
					if (x == 12 && y == 34) {
						assert.equal(3, array.get(x, y));
					} else {
						assert.equal('', array.get(x, y));
					}
				}
			}
			assert.equal(true, watcher._fetchMemoryOfWatcher().lastTiles === undefined);

			// fourth tick
			
			watcher.watchRoom();

			assert.equal(0, watcher._fetchMemoryOfWatcher().tick);
			
			var array = watcher._createTileArray(watcher._fetchMemoryOfWatcher().currentTiles);
			for (var x = 0; x < 50; x++) {
				for (var y = 0; y < 50; y++) {
					if (x == 12 && y == 34) {
						assert.equal(1, array.get(x, y));
					} else {
						assert.equal('', array.get(x, y));
					}
				}
			}

			var array = watcher._createTileArray(watcher._fetchMemoryOfWatcher().lastTiles);
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
	
			var watcher = new TileWatcher('test', room);
			watcher._fetchMemoryOfWatcher().enabled = false;
			watcher._watchRoomTiles = a => {
				var value = a.get(12, 34);
				a.set(12, 34, value ? (1 + parseInt(value)) : 1);
			};
			
			// tick
			
			watcher.watchRoom();

			assert.equal(0, watcher._fetchMemoryOfWatcher().tick);
			
			var array = watcher._createTileArray(watcher._fetchMemoryOfWatcher().currentTiles);
			for (var x = 0; x < 50; x++) {
				for (var y = 0; y < 50; y++) {
						assert.equal(undefined, array.get(x, y));
				}
			}
			assert.equal(true, watcher._fetchMemoryOfWatcher().lastTiles === undefined);
		});
	});
});