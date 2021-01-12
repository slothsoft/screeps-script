/*
 * API for Memory: https://docs.screeps.com/api/#Memory
 */

class Memory {

	constructor() {
		this.creeps = {};
	    this.rooms = {};
	    this.spawns = {};
	}
}

global.Memory = new Memory();
module.exports = Memory;
