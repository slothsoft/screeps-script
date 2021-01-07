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
    if (creep.memory.target) {
        var creepTarget = _.filter(targets, (target) => target.id == creep.memory.target);
        if (creepTarget.length > 0) {
            return creepTarget;
        }
    }
    var result = targets.sort((a, b) => a.hits - b.hits);
    if (result.length > 0) {
        creep.memory.target = result[0].id;
    }
    return result;
};

result.findTargets = function(room)  {
    return room.find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax * 0.9
    });
};

module.exports = result;