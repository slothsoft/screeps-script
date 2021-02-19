/*
 * API for RoomPosition: https://docs.screeps.com/api/#RoomPosition
 */

class RoomPosition {

	constructor(x = 0, y = 0, roomName) {
		this.x = x;
		this.y = y;
		this.roomName = roomName;
	}

	getRangeTo(targetOrX, y) {
		if (y !== undefined) {
			return this._getRangeToXY(targetOrX, y);
		}
		return this._getRangeToXY(targetOrX.pos.x, targetOrX.pos.y);
	}

	_getRangeToXY(x, y) {
		var targetX = x - this.x;
		var targetY = y - this.y;
		return Math.pow(targetX * targetX + targetY * targetY, 1/2);
	}
	
	findInRange() {
		return [];
	}
	
	isNearTo(target) {
		return target.pos.x == this.x && target.pos.y == this.y;
	}
}

module.exports = RoomPosition;
