/*
 * This class watches every tile of a room for a period of time 
 * and does some magic at the end of that period in response.
 */

var game = require('./main.game');

var TileArray = require('./tile.array');

class TileWatcher {
	
	constructor(id, room) {
		this._array = new TileArray(50, 50);
		this._id = id;
		this._room = room;
	}

	/*
	 * Fetches the memory of the room's watcher.
	 */
	
	_fetchMemoryOfWatcher() {
		var defaultArray = {
			enabled: true,
			watchTime: 1000,
			visualize: false,
			tick: 0,
		};
		if (this._room.memory[this._id]) {
			this._room.memory[this._id] = Object.assign(defaultArray, this._room.memory[this._id]);
		} else {
			this._room.memory[this._id] = defaultArray;
		}
		return this._room.memory[this._id];
	}
	
	/*
	 * Watches the room for an entire tick.
	 */

	watchRoom() {
		var memory = this._fetchMemoryOfWatcher();
		
		if (!memory.enabled) {
			return;
		}
		
		memory.tick++;
		
		if (memory.tick > memory.watchTime) {
			memory.tick = 0;
			memory.lastTiles = memory.currentTiles;
			memory.currentTiles = null;
		}
		
		var array = this._createTileArray(memory.currentTiles);
		this._watchRoomTiles(array);
		
		memory.currentTiles = array.toCompactString();

    	if (memory.visualize) {
    		this._printRoom(array);
    	}
	}
	
	/*
	 * Create a tile array from the tiles string.
	 */

	_createTileArray(currentTiles) {
		var array = new TileArray(50, 50);
		if (currentTiles) {
			array.fromCompactString(currentTiles);
		} 
		return array;
	}

	/*
	 * Does the actual watching - i.e. the tile array manipulation.
	 */

	_watchRoomTiles(array) {
		throw 'TileWatcher#watchRoomTiles is not implemented!';
	}

	/*
	 * Prints the values of the tile array onto the screen.
	 */
	
	_printRoom(array) {
		for (var x = 0; x < 50; x++) {
			for (var y = 0; y < 50; y++) {
				var value = array.get(x, y);
				if (value !== undefined) {
					this._room.visual.text(array.get(x, y), x, y, {align: 'center', opacity: 0.8});
				}
			}
		}
	}
}

module.exports = TileWatcher;