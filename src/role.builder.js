/*
 * Builders create buildings. 
 */
 
var RolePrototype = require('./role.prototype');
 
class Builder extends RolePrototype {

	constructor() {
		super('Builder', '#ffff00', '🔨');
	    this.priority = 70; 
	}

	/*
	 * Just transfer energy between source and and the construction sites.
	 */
	
    _work(creep) {
    	this._commuteBetweenSourceAndTarget(creep, target => creep.build(target));
    }
    
    /*
     * Valid targets are construction sites. 
     */
    
    _findTargets(room) {
        return room.find(FIND_MY_CONSTRUCTION_SITES);
    }

	/*
	 * Takes the closest to creep and closest to completion.
	 */
    
    _sortTargetForClosest(targets, creep) {
        return targets.sort((a, b) => {
        	var rangeA = creep.pos.getRangeTo(a);
        	var rangeB = creep.pos.getRangeTo(b);
        	var compare = Math.floor(rangeA / 5) - Math.floor(rangeB / 5);
        	if (compare) return compare;
        	
        	var progressLeftA = a.progressTotal - a.progress;
        	var progressLeftB = b.progressTotal - b.progress;
        	var compare = progressLeftA - progressLeftB;
        	if (compare) return compare;
        	
        	return compare;
        });
    }
        
}

module.exports = Builder;
