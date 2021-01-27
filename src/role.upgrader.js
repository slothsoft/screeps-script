/*
 * Upgrader handle the room controller.
 */
 
var game = require('./main.game');
var info = require('./main.info');

var RolePrototype = require('./role.prototype');
 
class Upgrader extends RolePrototype {

	constructor() {
		super('Upgrader', '#00ff00', '⚡');
	    this.priority = 50; 
	    
	    this._targetMode = RolePrototype.TARGET_MODE_USE_OR_ERROR;
	}

	/*
	 * Just transfer energy between source and and the room controllers.
	 */
	
    _work(creep) {
    	this._creep = creep;
        this._commuteBetweenSourceAndTarget(creep, target => creep.upgradeController(target));
    }
    
    /*
     * The only valid target is the room controller. And the room controller of the BASE at that. 
     * If the creep runs out of work while outside the base's room, he needs to get back.
     */
    
    _findTargets(room) {
    	if (!this._creep) {
    		return [ room.controller ];
    	}
    	var baseRooms = game.findAllRooms().filter(room => room.memory.base ? room.memory.base.name == this._creep.memory.home : false);
    	if (baseRooms.length > 0) {
    		return [ baseRooms[0].controller ];
    	}
    	info.error('Could not find base\'s room for ' + this._creep.memory.home);
		return [ room.controller ];
    }
}

module.exports = Upgrader;
