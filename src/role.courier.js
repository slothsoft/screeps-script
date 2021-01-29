/*
 * Couriers transfer data between two game objects of unknown type.
 * 
 * Right now only Mineral => Lab for RESOURCE_OXYGEN is supported. 
 */

var MainUtil = require('./main.util');
var info = require('./main.info');

var RolePrototype = require('./role.prototype');
 
class Courier extends RolePrototype {

	constructor() {
		super('Courier', '#ff8800', '📯');
	    this.priority = -1; 
	    
	    this._targetMode = RolePrototype.TARGET_MODE_USE_OR_WAIT;
	}

	isNecessary(room) {
		if (room.memory.source && room.memory.target) {
			return super.isNecessary(room);
		}
		return false;
	}
	
    _work(creep) {
        this._commuteBetweenSourceAndTarget(creep, target =>  creep.transfer(target, RESOURCE_OXYGEN));
    }

    _handleSourceWorkResult(creep, harvestResult) {
    	if (harvestResult == ERR_TIRED) {
    		creep.memory.working = true;
    	} else {
    		super._handleSourceWorkResult(creep, harvestResult);
    	}
    }

    _findSources(room) {
        return this._findById(room, room.memory.source);
    }

    _findTargets(room) {
        return this._findById(room, room.memory.target);
    }
    
    /*
     * Finds a source or target by its ID.
     * 
     * @param ID
     */

    _findById(room, id) {
    	var object = Game.getObjectById(id);
    	if (!object) {
    		info.error(MainUtil.getDisplayName(room) + ' could not find game object with ID: ' + id);
    		return [];
    	}
        return  [ object ];
    }
}

module.exports = Courier;

