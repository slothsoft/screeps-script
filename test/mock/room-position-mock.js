/*
 * API for RoomPosition: https://docs.screeps.com/api/#RoomPosition
 */

class RoomPosition {

	constructor() {
		this.x = 0;
		this.y = 0;
	}

	getRangeTo(target) {
		var targetX = target.pos.x - this.x;
		var targetY = target.pos.y - this.y;
		return Math.pow(targetX * targetX + targetY * targetY, 1/2);
	}
}

module.exports = RoomPosition;
