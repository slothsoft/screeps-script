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
	
    work(creep) {
    	this.commuteBetweenSourceAndTarget(creep, target => creep.repair(target));
    }
    
    /*
     * Valid targets are all broken structures. 
     */
    
    findTargets(room) {
        return room.find(FIND_STRUCTURES, {
            filter: object => object.hits < object.hitsMax * 0.9
        });
    }

	/*
	 * Takes the closest to creep and closest to completion.
	 */
    
    sortTargetForClosest(targets, creep) {
        if (creep.memory.target) {
            var creepTarget = targets.filter(object => (object.hits < object.hitsMax) && (object.id == creep.memory.target));
            if (creepTarget.length > 0) {
                return creepTarget;
            }
        }
        var result = targets.sort((a, b) => (a.hitsMax - a.hits) - (b.hitsMax - b.hits));
        if (result.length > 0) {
            creep.memory.target = result[0].id;
        }
        return result;
    }
        
}

module.exports = Handyman;