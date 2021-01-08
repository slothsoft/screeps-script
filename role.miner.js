/*
 * Miner cannot move or carry stuff, but they are very good at harvesting stuff. 
 * So have a container or storage ready for him to use.
 */
 
var info = require('main.info');

var RolePrototype = require('role.prototype');
 
var result = Object.create(RolePrototype);
result.roleName = 'Miner';
result.requiredNumber = 0;
result.color = '#000000';
result.symbol = '🛒';
result.priority = -1;
result.isNecessary = room => true;
    
result.spawnCreep = function(spawn) {
	return this.spawnCreepWithPartsAndSingle(spawn, [WORK], [MOVE, CARRY]);
};

// A source has 3000 energy and Respawns in 300 ticks. So we will never need to harvest more than
// 10 energy per tick which is 5 WORK parts
result.getPartsMaxMultiplier = spawn => 5;

result.work = function(creep) {
    this.creep = creep;
    
    if (!creep.memory.initialTicksToLive) {
        // this is the first time we actually DO something
        // -> remember intial ticksToLive for later
        creep.memory.initialTicksToLive = creep.ticksToLive;
    }
    
    this.commuteBetweenSourceAndTarget(creep, target =>  creep.transfer(target, RESOURCE_ENERGY));
    
    // we know how long it took this creep to the resource
    // so we need to retrain our replacement before we die
    if (creep.memory.ticksToSource && !creep.memory.trainedReplacement) {
        
        var timeToSpawn = (this.getPartsMaxMultiplier() + 2) * 3; // one part tacks 3 ticks
        var ticksToGetReady = (creep.memory.initialTicksToLive - creep.memory.ticksToSource) + timeToSpawn;
        
        if (creep.ticksToLive < ticksToGetReady) {
            var spawnedCreep = spawnMiner(creep.memory.homeSpawn, creep.memory.homeSource);
            if (spawnedCreep) {
                info.log(this.symbol + " Training the replacement " + this.roleName);
                creep.memory.trainedReplacement = true;
            }
        }
    }
};

result.moveToSource = function(creep) {
    var sources = creep.room.find(FIND_SOURCES, {
        filter: (structure) => {
            return (structure.id == creep.memory.homeSource);
        }
    });
    
	if (sources.length == 0) {
        info.log("🛑 Could not find source: " + creep.memory.homeSource);
	    return;
	}
	
	var source = sources[0];
	
	var harvestResult = creep.harvest(source);
    if (harvestResult == ERR_NOT_IN_RANGE) {
        if (creep.memory.debug) {      
            info.log(creep.memory.role + " is moving to source " + source.id);  
        }
        this.moveToLocation(creep, source);
    } else if (harvestResult == OK) {     
        if (!creep.memory.ticksToSource) {
            // this is the first time we can harvest the source
            // -> remember time for later
            creep.memory.ticksToSource = creep.ticksToLive;
        }
        if (creep.memory.debug) {
            info.log(creep.memory.role + " is harvesting from source " + source.id);  
        }
    } else {      
        info.log(creep.memory.role + " cannot harvest: " + harvestResult);  
    }
};

result.findTargets = function(room) {
    var testCreepPosition = this.creep && this.creep.memory.ticksToSource;
    return room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE ||
                        structure.structureType == STRUCTURE_CONTAINER ||
                        structure.structureType == STRUCTURE_LINK) && 
                       (!testCreepPosition || this.creep.pos.inRangeTo(structure, 7)) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
    });
};

module.exports = result;

