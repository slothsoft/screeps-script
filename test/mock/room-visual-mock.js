/*
 * API for Room: https://docs.screeps.com/api/#Room
 */

require('./game-mock');

class RoomVisual {

	constructor() {
	}
	
	clear() {
		this.elements = [];
		for (var x = 0; x < 50; x++) {
			this.elements[x] = [];
		} 
	}
	
	text(text, x, y) {
		if (!this.elements) this.clear();
		this.elements[x][y] = text;
	}
}

module.exports = RoomVisual;
