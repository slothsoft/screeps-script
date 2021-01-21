/*
 * This manager handles road building.
 */

var game = require('./main.game');

var TileWatcher = require('./tile.watcher');
 
class RoadManager extends TileWatcher {

	/*
	 * Performs 'watchRooms()' on an instance of RoadManager for each room. 
	 */
	
	static watchAllRooms() {
	    game.findAllRooms().forEach(room => new RoadManager(room).watchRoom());
	}
	
	constructor(room) {
		super('roadManager', room);
	}

	fetchMemoryOfWatcher() {
		var defaultArray = {
			enabled: true,
			watchTime: 1000,
			visualize: false,
			tick: 0,
			threshold: 100,
		};
		if (this.room.memory[this.id]) {
			this.room.memory[this.id] = Object.assign(defaultArray, this.room.memory[this.id]);
		} else {
			this.room.memory[this.id] = defaultArray;
		}
		return this.room.memory[this.id];
	}
	
	watchRoom() {
		// if there is no creep we don't need to watch that particular room
		if (this.room.find(FIND_MY_CREEPS).length > 0) {
			super.watchRoom();
		}
	}
	
	
	/*
	 * Count the creeps on the tiles. 
	 */

	watchRoomTiles(array) {
		this.room.find(FIND_MY_CREEPS).forEach(creep => {
			var value = array.get(creep.pos.x, creep.pos.y);
			array.set(creep.pos.x, creep.pos.y, value ? (parseInt(value) + 1) : 1);
		});
	}
	
	/*
	 * Fetch all positions with values over the threshold.
	 */
	
	fetchPositionsOverThreshold() {
		var result = [];
		
		var memory = this.fetchMemoryOfWatcher();

		if (!memory.lastTiles)
			return  result;
		
		var array = this.createTileArray(memory.lastTiles);

		for (var x = 0; x < 50; x++) {
			for (var y = 0; y < 50; y++) {
				var value = parseInt(array.get(x, y));
				if (value >= memory.threshold) {
					result.push({
						x: x,
						y: y,
						value: value,
					});
				}
			}
		}
		return result.sort((a, b) => b.value - a.value).map(pos => new RoomPosition(pos.x, pos.y, this.room.name));
	}

};

module.exports = RoadManager;