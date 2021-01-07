/*
 * Handyman repair buildings. 
 */
 
var RolePrototype = require('role.prototype');
 
var result = Object.create(RolePrototype);
result.roleName = 'Handyman';
result.requiredNumber = 0;
result.color = '#0000ff';
result.symbol = '🔧';
result.work = creep => result.commuteBetweenSourceAndTarget(creep, target =>  creep.repair(target));
    
result.sortTargetForClosest = function(targets, creep) {
    return targets.sort((a, b) => a.hits - b.hits);
};

result.findTargets = function(room)  {
    return room.find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax
    });
};

module.exports = result;