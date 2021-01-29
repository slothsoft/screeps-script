/*
 * Harvesters collect resources that can be used to do stuff.
 */

var MainUtil = require('./main.util');

var RolePrototype = require('./role.prototype');
 
class Harvester extends RolePrototype {

	constructor() {
		super('Harvester', '#ffffff', '🧺');
	    this.priority = 100; 
	}

	/*
	 * Just transfer energy between source and and the targets.
	 */
	
    _work(creep) {
        this._commuteBetweenSourceAndTarget(creep, target =>  creep.transfer(target, RESOURCE_ENERGY));
    }
    
    /*
     * Valid targets are everything where energy can be stored. 
     */
    
    _findTargets(room) {
        return room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            (structure.structureType == STRUCTURE_LINK && MainUtil.fetchMemoryOfStructure(structure).type == 'source') ||
                            structure.structureType == STRUCTURE_TOWER) && 
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
        });
    }
}

module.exports = Harvester;

