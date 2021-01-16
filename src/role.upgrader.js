/*
 * Upgrader handle the room controller.
 */
 
var RolePrototype = require('./role.prototype');
 
class Upgrader extends RolePrototype {

	constructor() {
		super('Upgrader', '#00ff00', '⚡');
	    this.priority = 50; 
	}

	/*
	 * Just transfer energy between source and and the room controllers.
	 */
	
    work(creep) {
        this.commuteBetweenSourceAndTarget(creep, target => creep.upgradeController(target));
    }
    
    /*
     * The only valid target is the room controller.
     */
    
    findTargets(room) {
        return [ room.controller ];
    }
}

module.exports = Upgrader;
