/*
 * Builder create buildings. 
 */
 
var RolePrototype = require('role.prototype');
 
var result = Object.create(RolePrototype);
result.roleName = 'Builder';
result.requiredNumber = 3;
result.color = '#ffff00';
result.symbol = '🔨';
    
result.findTargets = function(room) {
    return room.find(FIND_CONSTRUCTION_SITES);
};

result.work = function(creep) {

    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.building = false;
    }
    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
        creep.memory.building = true;
    }

    if(creep.memory.building) {
        this.moveToClosestTarget(creep, target => creep.build(target));
    } else {
        this.moveToSource(creep);
    }
};

module.exports = result;