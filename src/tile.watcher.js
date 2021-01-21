/*
 * This class watches every tile of a room for a period of time 
 * and does some magic at the end of that period in response.
 */

var game = require('./main.game');

var TileArray = require('./tile.array');

class TileWatcher {
	
	constructor(id, room) {
		this.array = new TileArray(50, 50);
		this.id = id;
		this.room = room;
	}

	/*
	 * Fetches the memory of the room's watcher.
	 */
	
	fetchMemoryOfWatcher() {
		var defaultArray = {
			enabled: true,
			watchTime: 1000,
			visualize: false,
			tick: 0,
		};
		if (this.room.memory[this.id]) {
			this.room.memory[this.id] = Object.assign(defaultArray, this.room.memory[this.id]);
		} else {
			this.room.memory[this.id] = defaultArray;
		}
		return this.room.memory[this.id];
	}
	
	/*
	 * Watches the room for an entire tick.
	 */

	watchRoom() {
		var memory = this.fetchMemoryOfWatcher();
		
		if (!memory.enabled) {
			return;
		}
		
		memory.tick++;
		
		if (memory.tick > memory.watchTime) {
			memory.tick = 0;
			memory.lastTiles = memory.currentTiles;
			memory.currentTiles = null;
		}
		
		var array = this.createTileArray(memory.currentTiles);
		this.watchRoomTiles(array);
		
		memory.currentTiles = array.toCompactString();

    	if (memory.visualize) {
    		this.printRoom(array);
    	}
	}
	
	/*
	 * Create a tile array from the tiles string.
	 */

	createTileArray(currentTiles) {
		var array = new TileArray(50, 50);
		if (currentTiles) {
			array.fromCompactString(currentTiles);
		} 
		return array;
	}

	/*
	 * Does the actual watching - i.e. the tile array manipulation.
	 */

	watchRoomTiles(array) {
		throw 'TileWatcher#watchRoomTiles is not implemented!';
	}

	/*
	 * Prints the values of the tile array onto the screen.
	 */
	
	printRoom(array) {
		for (var x = 0; x < 50; x++) {
			for (var y = 0; y < 50; y++) {
		        this.room.visual.text(array.get(x, y), x, y, {align: 'center', opacity: 0.8});
			}
		}
	}
}

module.exports = TileWatcher;