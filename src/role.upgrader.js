/*
 * Upgrader handle the room controller.
 */
 
var RolePrototype = require('./role.prototype');
 
class Upgrader extends RolePrototype {

	constructor() {
		super('Upgrader', '#00ff00', '⚡');
	    this._priority = 50; 
	}

	/*
	 * Just transfer energy between source and and the room controllers.
	 */
	
    _work(creep) {
        this._commuteBetweenSourceAndTarget(creep, target => creep.upgradeController(target));
    }
    
    /*
     * The only valid target is the room controller.
     */
    
    _findTargets(room) {
        return [ room.controller ];
    }
}

module.exports = Upgrader;
