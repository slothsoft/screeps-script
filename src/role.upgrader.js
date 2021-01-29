/*
 * Upgraders handle the room controller.
 */
 
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
        this._commuteBetweenSourceAndTarget(creep, target => creep.upgradeController(target));
    }
    
    /*
     * The only valid target is the room controller. And the room controller of the BASE at that. 
     * If the creep runs out of work while outside the base's room, he needs to get back.
     */
    
    _findTargets(room) {
    	return [ room.controller ];
    }
}

module.exports = Upgrader;
