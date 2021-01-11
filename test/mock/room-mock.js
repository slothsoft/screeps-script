/*
 * API for Room: https://docs.screeps.com/api/#Room
 */

require('./game-mock');
require('./memory-mock');

class Room {

	constructor() {
		this.id = 'Room' + Game.rooms.length;
	    Game.rooms[this.id] = this;
			
	    this.memory = Memory.rooms[this.id] = {};
	    this.energyAvailable = 0;
	}
}

module.exports = Room;
