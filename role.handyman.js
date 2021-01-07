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
    
result.findTargets = function(room)  {
    return room.find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax
    }).sort((a, b) => a.hits - b.hits);
};

module.exports = result;