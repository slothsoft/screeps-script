/*
 * Courier transfer data between two game objects of unknown type.
 * 
 * Right now only Mineral => Lab for RESOURCE_OXYGEN is supported. 
 */

var game = require('./main.game');
var info = require('./main.info');

var RolePrototype = require('./role.prototype');
 
class Courier extends RolePrototype {

	constructor() {
		super('Courier', '#ff8800', '📯');
	    this.priority = -1; 
	}

	isNecessary(room) {
		if (room.memory.source && room.memory.target) {
			return super.isNecessary(room);
		}
		return false;
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
        return this.findById(room, room.memory.source);
    }

    findTargets(room) {
        return this.findById(room, room.memory.target);
    }
    
    /*
     * Finds a source or target by its ID.
     * 
     * @param ID
     */

    findById(room, id) {
    	var object = Game.getObjectById(id);
    	if (!object) {
    		info.error(game.getDisplayName(room) + ' could not find game object with ID: ' + id);
    		return [];
    	}
        return  [ object ];
    }
}

module.exports = Courier;

