/*
 * Builder create buildings. 
 */
var rolePrototype = require('role.prototype');
 
var roleBuilder = {

    roleName: 'Builder',
    requiredNumber: 1,
    color: '#ffff00',
    
    isNecessary: function(room) {
        return room.find(FIND_CONSTRUCTION_SITES).length;
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

	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: this.color}});
                }
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

module.exports = roleBuilder;