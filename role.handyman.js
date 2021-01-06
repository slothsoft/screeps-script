/*
 * Handyman repair buildings. 
 */
 
var RolePrototype = require('role.prototype');
 
var result = Object.create(RolePrototype);
result.roleName = 'Handyman';
result.requiredNumber = 2;
result.color = '#0000ff';
result.symbol = '🔧';
    
result.findTargets = function(room)  {
    return room.find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax
    }).sort((a, b) => a.hits - b.hits);
};

result.work = function(creep) {
    if (creep.store.getFreeCapacity() > 0) {
        this.moveToSource(creep);
    } else {
        this.moveToClosestTarget(creep, target => creep.repair(target));
    }
};

module.exports = result;