/*
 * Upgrader handle the room controller.
 */
var rolePrototype = require('role.prototype');
 
var result = {

    roleName: 'Upgrader',
    requiredNumber: 1,
    color: '#00ff00',
    
    isNecessary: function() {
        return true;
    },
    
    /** @param {Spawn} spawn **/
    spawnCreep: function(spawn, newName) {
        var parts = rolePrototype.calculateMaxParts(spawn, [WORK,CARRY,MOVE]);
        if (parts) {
            return spawn.spawnCreep(parts, newName, {memory: {role: this.roleName}});
        }
        return false;
    },
    
    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: this.color}});
            }
        }
        else {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: this.color}});
            }
        }
	}
};

module.exports = result;