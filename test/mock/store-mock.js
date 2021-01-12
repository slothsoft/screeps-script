/*
 * API for Store: https://docs.screeps.com/api/#Store
 */

require('./game-mock');

global.RESOURCE_ENERGY = "energy";
global.RESOURCE_POWER = "power";

global.RESOURCE_HYDROGEN = "H";
global.RESOURCE_OXYGEN = "O";
global.RESOURCE_UTRIUM = "U";
global.RESOURCE_LEMERGIUM = "L";
global.RESOURCE_KEANIUM = "K";
global.RESOURCE_ZYNTHIUM = "Z";
global.RESOURCE_CATALYST = "X";
global.RESOURCE_GHODIUM = "G";

class Store {
	
	constructor(capacity, usedCapacity = 0) {
		this.usedCapacity = usedCapacity;
		this.capacity = capacity;
	}

	getCapacity(resource) {
		return this.capacity;
	}

	getFreeCapacity(resource) {
		return this.capacity - this.usedCapacity;
	}

	getUsedCapacity(resource) {
		return this.usedCapacity;
	}
	
}

module.exports = Store;
