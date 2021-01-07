/*
 * Harvester collect resources that can be used to do stuff.
 */
var RolePrototype = require('role.prototype');
 
var result = Object.create(RolePrototype);
result.roleName = 'Harvester';
result.requiredNumber = 2;
result.color = '#ffffff';
result.symbol = '🧺';
result.work = creep => result.commuteBetweenSourceAndTarget(creep, target =>  creep.transfer(target, RESOURCE_ENERGY));

result.findTargets = function(room)  {
    return room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && 
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
    });
};

module.exports = Object.create(result);