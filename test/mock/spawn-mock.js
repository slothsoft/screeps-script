/*
 * API for Spawn: https://docs.screeps.com/api/#StructureSpawn
 */

require('./game-mock');
require('./memory-mock');

var Creep = require('./creep-mock');
var Room = require('./room-mock');
var RoomPosition = require('./room-position-mock.js');
var Store = require('./store-mock.js');

class Spawn {
	
	constructor(room = new Room()) {
		this.id = 'Spawn' + Spawn.nextId++;
	    Game.spawns[this.id] = this;
		
	    this.memory = Memory.spawns[this.id] = {};
		this.pos = new RoomPosition();	
		this.store = new Store(300);
	    
	    this.room = room;
	}
	
	spawnCreep(body, name, opts = {}) {
		var bodyCost = this.calculateCostsForParts(body);
		if (bodyCost <= this.room.energyAvailable) {
			this.room.energyAvailable -= bodyCost;
			new Creep(name, body, opts.memory);
			return OK;
		}
		return ERR_NOT_ENOUGH_ENERGY;
	}
    
    calculateCostsForParts(parts) {
        var result = 0;
        parts.forEach(part => result += BODYPART_COST[part]);
        return result;
    }
    
    recycleCreep(creep) {
		if (this.pos.x == creep.pos.x && this.pos.y == creep.pos.y) {
			var usedAmount = 300;
			this.store.usedCapacity += usedAmount;
			creep.suicide();
			return OK;
		}
		return ERR_NOT_IN_RANGE;
    }

}
Spawn.nextId = 1;

module.exports = Spawn;
