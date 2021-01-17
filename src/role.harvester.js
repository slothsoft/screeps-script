/*
 * Harvester collect resources that can be used to do stuff.
 */

var RolePrototype = require('./role.prototype');
 
class Harvester extends RolePrototype {

	constructor() {
		super('Harvester', '#ffffff', '🧺');
	    this.priority = 100; 
	    this.useStorageAsSource = false;
	    this.useSourceAsSource = true;
	}

	/*
	 * Just transfer energy between source and and the targets.
	 */
	
    work(creep) {
        this.commuteBetweenSourceAndTarget(creep, target =>  creep.transfer(target, RESOURCE_ENERGY));
    }
    
    /*
     * Valid targets are everything where energy can be stored. 
     */
    
    findTargets(room) {
        return room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            (structure.structureType == STRUCTURE_LINK && structure.memory && structure.memory.type == 'source') ||
                            structure.structureType == STRUCTURE_TOWER) && 
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
        });
    }
}

module.exports = Harvester;

