/*
 * Courier transfer data between two game objects of unknown type.
 * 
 * Right now only Mineral => Lab for RESOURCE_OXYGEN is supported. 
 */

var info = require('./main.info');

var RolePrototype = require('./role.prototype');
 
class Courier extends RolePrototype {

	constructor() {
		super('Courier', '#ff8800', '📯');
	    this.priority = -1; 
	}
	
    work(creep) {
        this.commuteBetweenSourceAndTarget(creep, target =>  creep.transfer(target, RESOURCE_OXYGEN));
    }

    handleSourceWorkResult(creep, harvestResult) {
    	if (harvestResult == ERR_TIRED) {
    		creep.memory.working = true;
    	} else {
    		super.handleSourceWorkResult(creep, harvestResult);
    	}
    }

    findSources(room) {
        return this.findById(room.memory.source);
    }

    findTargets(room) {
        return this.findById(room.memory.target);
    }
    
    /*
     * Finds a source or target by its ID.
     * 
     * @param ID
     */

    findById(id) {
    	var object = Game.getObjectById(id);
    	if (!object) {
    		info.error('Could not find game object with ID: ' + id);
    		return [];
    	}
        return  [ object ];
    }
}

module.exports = Courier;

