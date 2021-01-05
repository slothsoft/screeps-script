/*
 * Harvester collect resources that can be used to do stuff.
 */
var rolePrototype = require('role.prototype');
 
var result = {

    roleName: 'Harvester',
    requiredNumber: 2,
    color: '#ffffff',
    
    /** @param {Creep} creep **/
    isNecessary: function(room) {
        return this.findStructuresToFill(room).length > 0;
    },
    
    /** @param {Spawn} spawn **/
    spawnCreep: function(spawn, newName) {
        var parts = rolePrototype.calculateMaxParts(spawn, [WORK,CARRY,MOVE]);
        if (parts) {
            console.log("Harvey: " +parts);
            return spawn.spawnCreep(parts, newName, {memory: {role: this.roleName}});
        }
        return false;
    },
    
    findStructuresToFill: function(room) {
        return room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && 
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
        });
    },

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.store.getFreeCapacity() > 0) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: this.color}});
            }
        }
        else {
            var targets = this.findStructuresToFill(creep.room);
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: this.color}});
                }
            }
        }
	}
};

module.exports = result;