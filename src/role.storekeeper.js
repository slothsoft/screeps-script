/*
 * Storekeeper are great runners with good carry abilities, but they can't work.
 * They take energy from containers and storages and distribute them to extensions etc. 
 * like a harvester.
 */
 
var info = require('./main.info');

var RolePrototype = require('./role.prototype');

class StoreKeeper extends RolePrototype {

	constructor() {
		super('Storekeeper', '#ff9900', '🏭');
		this.priority = -1;
	}

	isNecessary(room) {
		return true;
	}

	work(creep) {
		this.commuteBetweenSourceAndTarget(creep, target => creep.transfer(target, RESOURCE_ENERGY));
	}

	spawnCreep(spawn) {
		return this.spawnCreepWithParts(spawn, [MOVE, CARRY], [ MOVE, MOVE ]);
	}

    findSources(room) {
	    return room.find(FIND_MY_STRUCTURES, {
	            filter: (structure) => {
	                return (structure.structureType == STRUCTURE_STORAGE ||
	                        structure.structureType == STRUCTURE_CONTAINER) && 
	                        structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
	            }
	    });
    }
    
    findTargets(room)  {
        return room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && 
                            (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                }
        });
    }
};

module.exports = StoreKeeper;

