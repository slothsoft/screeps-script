/*
 * Upgrader handle the room controller.
 */
 
var RolePrototype = require('./role.prototype');
 
var result = Object.create(RolePrototype);
result.roleName = 'Upgrader';
result.requiredNumber = 1;
result.color = '#00ff00';
result.symbol = '⚡';
result.work = creep => result.commuteBetweenSourceAndTarget(creep, target => creep.upgradeController(target));
result.priority = 50;

result.findTargets = function(room) {
    return [ room.controller ];
};

module.exports = result;