/*
 * Handyman repair buildings. 
 */
 
var RolePrototype = require('role.prototype');
 
var result = Object.create(RolePrototype);
result.roleName = 'Handyman';
result.requiredNumber = 1;
result.color = '#0000ff';
result.symbol = '🔧';
result.spawnCreep = spawn => result.spawnCreepWithParts(spawn, [WORK,CARRY,MOVE]);
    
result.isNecessary = function(room) {
    return this.findStructuresToRepair(room).length;
};

result.findStructuresToRepair = function(room)  {
    return room.find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax
    });
};

/** @param {Creep} creep **/
result.run = function(creep) {
    if(creep.store.getFreeCapacity() > 0) {
        this.moveToSource(creep);
    } else {
        const targets = this.findStructuresToRepair(creep.room);
        
        targets.sort((a,b) => a.hits - b.hits);
        
        if (targets.length > 0) {
            console.log("Repair: "+ creep.repair(targets[0]));
            if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: this.color}});
            }
        }
    }
};

module.exports = result;