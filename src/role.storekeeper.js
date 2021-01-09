/*
 * Storekeeper are great runners with good carry abilities, but they can't work.
 * They take energy from containers and storages and distribute them to extensions etc. 
 * like a harvester.
 */
 
var info = require('main.info');

var RolePrototype = require('role.prototype');
 
var result = Object.create(RolePrototype);
result.roleName = 'Storekeeper';
result.requiredNumber = 1;
result.color = '#ff9900';
result.symbol = '🏭';
result.work = creep => result.commuteBetweenSourceAndTarget(creep, target =>  creep.transfer(target, RESOURCE_ENERGY));
result.priority = -1;
result.isNecessary = room => true;

result.spawnCreep = function(spawn) {
	return this.spawnCreepWithParts(spawn, [MOVE, MOVE, MOVE, CARRY]);
};

result.moveToSource = function(creep) {
    var sources = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE ||
                        structure.structureType == STRUCTURE_CONTAINER) && 
                        structure.store[RESOURCE_ENERGY] > 0;
            }
    });
    
	if (sources.length == 0) return;
	
	var source = this.sortTargetForClosest(sources, creep)[0];
	
	var withdrawResult = creep.withdraw(source, RESOURCE_ENERGY);
    if (withdrawResult == ERR_NOT_IN_RANGE) {
        if (creep.memory.debug) {      
            info.log(creep.memory.role + ' is moving to source ' + source.id);  
        }
        this.moveToLocation(creep, source);
    } else if (withdrawResult == OK) {     
        if (creep.memory.debug) {
            info.log(creep.memory.role + ' is withdrawing from source ' + source.id);  
        }
    } else {      
        info.log(creep.memory.role + ' cannot withdraw: ' + withdrawResult);  
    }
};

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

module.exports = result;

