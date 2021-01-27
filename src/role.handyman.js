/*
 * Handyman repair buildings. 
 */
 
var RolePrototype = require('./role.prototype');
 
class Handyman extends RolePrototype {

	constructor() {
		super('Handyman', '#0000ff', '🔧');
	}

	/*
	 * Just transfer energy between source and and the broken structures.
	 */
	
    _work(creep) {
    	this._commuteBetweenSourceAndTarget(creep, target => creep.repair(target));
    }
    
    /*
     * Valid targets are all broken structures. 
     */
    
    _findTargets(room) {
    	
    	var necessaryDamageInPercent = 0.95;
    	
    	// 1st priority: roads (max hits: 5000) & containers (max hits: 250K)

        var results = room.find(FIND_STRUCTURES, {
            filter: structure => {
            	return (structure.structureType == STRUCTURE_ROAD ||
                        structure.structureType == STRUCTURE_CONTAINER) &&
                        structure.hits / structure.hitsMax < necessaryDamageInPercent;
            }
        });
        if (results.length > 0) {
        	return results;
        }

    	// 2nd priority: freshly build  walls (max hits: 300M) & ramparts (max hits: 30M)
        
        var results =  room.find(FIND_STRUCTURES, {
            filter: structure => {
            	return (structure.structureType == STRUCTURE_WALL ||
                        structure.structureType == STRUCTURE_RAMPART) &&
                        structure.hits < 100;
            }
        });
        if (results.length > 0) {
        	return results;
        }

    	// last priority: walls (max hits: 300M) & ramparts (max hits: 30M)
        
        var results =  room.find(FIND_STRUCTURES, {
            filter: structure => {
            	return (structure.structureType == STRUCTURE_WALL ||
                        structure.structureType == STRUCTURE_RAMPART) &&
                        structure.hits / structure.hitsMax < necessaryDamageInPercent;
            }
        });
        return results;
    }

	/*
	 * Takes the closest to creep and closest to completion.
	 */
    
    _sortTargetForClosest(targets, creep) {
        var result = targets.sort((a, b) => (a.hits / a.hitsMax) - (b.hits / b.hitsMax));
        if (result.length > 0) {
            creep.memory.target = result[0].id;
        }
        return result;
    }
        
}

module.exports = Handyman;