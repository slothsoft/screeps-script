/*
 * Harvester collect resources that can be used to do stuff.
 */
var RolePrototype = require('role.prototype');
 
var result = Object.create(RolePrototype);
result.roleName = 'Harvester';
result.requiredNumber = 4;
result.color = '#ffffff';
result.symbol = '🔄';
result.spawnCreep = spawn => result.spawnCreepWithParts(spawn, [WORK,CARRY,MOVE]);
    
result.isNecessary = function(room) {
    return this.findStructuresToFill(room).length > 0;
};

result.findStructuresToFill = function(room)  {
    return room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && 
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
    });
};


/** @param {Creep} creep **/
result.run = function(creep) {
    if(creep.store.getFreeCapacity() > 0) {
        this.moveToSource(creep);
    } else {
        var targets = this.findStructuresToFill(creep.room);
        if(targets.length > 0) {
            if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: this.color}});
            }
        }
    }
};

module.exports = Object.create(result);