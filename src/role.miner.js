/*
 * Miners cannot move or carry stuff, but they are very good at harvesting stuff. 
 * So have a container or storage ready for him to use.
 */
 
var info = require('./main.info');
var MainUtil = require('./main.util');

var MemoryManager = require('./manager.memory');

var RolePrototype = require('./role.prototype');

class Miner extends RolePrototype {

	constructor() {
		super('Miner', '#000000', '🛒');
		this.priority = -1; // we never need more than the defined miners
		this._maxRangeToTarget = 7;

	    this._targetMode = RolePrototype.TARGET_MODE_USE_OR_WAIT;
	}

	isNecessary(room) {
		return true;
	}
	
	/*
	 * This method is called by the framework, so we need to find an open
	 * source for the creep to attach to.
	 */
	
	spawnCreep(spawn) {
		var claimedSources = MainUtil.findAllCreeps().filter(creep => creep.memory.role == 'Miner').filter(creep => creep.memory.source).map(creep => creep.memory.source);
		var allSources = spawn.room.find(FIND_SOURCES).filter(source => !claimedSources.includes(source.id));
		if (allSources.length > 0) {
			return this._spawnCreepFromSpawn(spawn, allSources[0].id);
		}
		return false;
	}

	spawnCreepFromSpawnName(spawnName, sourceId) {
	    var spawns = MainUtil.findAllSpawns().filter(spawn => spawn.name == spawnName);
	    if (spawns.length == 0) {
	        info.error('Could not find spawn: ' + spawnName);
	        return false;
	    }
	    var spawn = spawns[0];
	    var resultingCreep = this._spawnCreepFromSpawn(spawn, sourceId);
	    if (resultingCreep) {
	        info.log(this.symbol + ' Spawning new ' + this.roleName + ' (' + resultingCreep.body.length + 'p)', this._baseRoom);
	        return resultingCreep;
	    }
	    return resultingCreep;
	}

	_spawnCreepFromSpawn(spawn, sourceId) {
	    if (!sourceId) {
	        info.error('The source is mandatory!');
	        return false;
	    }
	    var resultingCreep = this._spawnCreepWithParts(spawn, [WORK], [MOVE, CARRY]);
	    if (resultingCreep) {
	        resultingCreep.memory.homeSpawn = spawn.name;
	        resultingCreep.memory.source = sourceId;
	        return resultingCreep;
	    }
	    return resultingCreep;
	}
	
	/*
	 * A source has 3000 energy and respawns in 300 ticks. So we will never need to harvest more than
	 * 10 energy per tick which is 5 WORK parts.
	 */

	_getPartsMaxMultiplier(spawn) {
		return 6; // fixes some rounding errors
	}

	_work(creep) {
	    this.creep = creep;
	    
	    if (!creep.memory.initialTicksToLive) {
	        // this is the first time we actually DO something
	        // -> remember intial ticksToLive for later
	        creep.memory.initialTicksToLive = creep.ticksToLive;
	    }
	    
	    this._commuteBetweenSourceAndTarget(creep, target =>  creep.transfer(target, RESOURCE_ENERGY));
	    
	    // we know how long it took this creep to the resource
	    // so we need to retrain our replacement before we die
	    if (creep.memory.ticksToSource && !creep.memory.trainedReplacement) {
	        var timeToSpawn = (this._getPartsMaxMultiplier() + 2) * 3; // one part tacks 3 ticks
	        var ticksToGetReady = (creep.memory.initialTicksToLive - creep.memory.ticksToSource) + timeToSpawn;

	        if (creep.ticksToLive < ticksToGetReady) {
	            var spawnedCreep = this.spawnCreepFromSpawnName(creep.memory.homeSpawn, creep.memory.source);
	            if (spawnedCreep) {
	                info.log(this.symbol + ' Training the replacement ' + this.roleName, this._baseRoom);
	                creep.memory.trainedReplacement = true;
	            }
	        }
	    }
	} 
	
	_moveToClosestSource(creep) {
		var harvestResult = super._moveToClosestSource(creep);
	    
		if (harvestResult == OK) {     
	        if (!creep.memory.ticksToSource) {
	            // this is the first time we can harvest the source
	            // -> remember time for later
	            creep.memory.ticksToSource = creep.ticksToLive;
	        }
	    } 
		return harvestResult;
	}

    _handleSourceWorkResult(creep, workResult) {
    	if (workResult == ERR_NOT_ENOUGH_RESOURCES) {
    			// we mined the source completely ahead of time - ignore
    			return;
    	}
    	super._handleSourceWorkResult(creep, workResult);
    }

	_findTargets(room) {
		// creep must be defined and have reached the source to check the range
	    var testCreepPosition = this.creep && this.creep.memory.ticksToSource;
	    return room.find(FIND_STRUCTURES, {
	            filter: (structure) => {
	                return (structure.structureType == STRUCTURE_STORAGE ||
	                        structure.structureType == STRUCTURE_CONTAINER ||
                            (structure.structureType == STRUCTURE_LINK && MainUtil.fetchMemoryOfStructure(structure).type == 'source')) &&
	                       (!testCreepPosition || this.creep.pos.inRangeTo(structure, this._maxRangeToTarget)) &&
	                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
	            }
	    });
	};
}

module.exports = Miner;

