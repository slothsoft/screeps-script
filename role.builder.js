/*
 * Builder create buildings. 
 */
 
var RolePrototype = require('role.prototype');
 
var result = Object.create(RolePrototype);
result.roleName = 'Builder';
result.requiredNumber = 2;
result.color = '#ffff00';
result.symbol = '🔨';
result.spawnCreep = spawn => result.spawnCreepWithParts(spawn, [WORK,CARRY,MOVE]);
    
result.isNecessary = function(room) {
    return room.find(FIND_CONSTRUCTION_SITES).length;
};

/** @param {Creep} creep **/
result.run = function(creep) {

    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.building = false;
    }
    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
        creep.memory.building = true;
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
        this.moveToSource(creep);
    }
};

module.exports = result;