/*
 * Upgrader handle the room controller.
 */
 
var RolePrototype = require('role.prototype');
 
var result = Object.create(RolePrototype);
result.roleName = 'Upgrader';
result.requiredNumber = 1;
result.color = '#00ff00';
result.symbol = '⚡';
result.spawnCreep = spawn => result.spawnCreepWithParts(spawn, [WORK,CARRY,MOVE]);
    
result.isNecessary = function(room) {
    return true;
};

/** @param {Creep} creep **/
result.run = function(creep) {
        
    if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.upgrading = false;
    }
    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
        creep.memory.upgrading = true;
    }

    if(creep.memory.upgrading) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: this.color}});
        }
    } else {
        this.moveToSource(creep);
    }
};

module.exports = result;