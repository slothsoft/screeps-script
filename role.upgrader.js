/*
 * Upgrader handle the room controller.
 */
 
var RolePrototype = require('role.prototype');
 
var result = Object.create(RolePrototype);
result.roleName = 'Upgrader';
result.requiredNumber = 1;
result.color = '#00ff00';
result.symbol = '⚡';

result.findTargets = function(room) {
    return [ room.controller ];
};

result.work = function(creep) {
        
    if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.upgrading = false;
    }
    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
        creep.memory.upgrading = true;
    }

    if(creep.memory.upgrading) {
        this.moveToClosestTarget(creep, target => creep.upgradeController(target));
    } else {
        this.moveToSource(creep);
    }
};

module.exports = result;