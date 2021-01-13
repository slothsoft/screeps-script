/*
 * This code is shared between the roles. It has standard behavior like:
 * - basic fields & methods
 * - moving to an appropriate source
 * - spawning new creeps
 * - commuting between an source and a target
 * 
 * You need to implement / set:
 * - roleName, requiredNumber
 * - (color, symbol)
 * - findTargets(room)
 * - work(creep)
 * 
 * You might need to override / set:
 * - priority
 * - useStorageAsSource, useSourceAsSource
 * - isNecessary(room) (on default it returns if a valid target is found)
 * - sortTargetForClosest(targets, creep) (on default it sorts for positions)
 */
 
var constants = require('./main.constants');
var game = require('./main.game');
var info = require('./main.info');

class RolePrototype {
    
	constructor(roleName = 'XXX', requiredNumber = 0, color = '#ff0000', symbol = '❗') {
	    this.roleName = roleName;
	    this.requiredNumber = requiredNumber;
	    this.color = color;
	    this.symbol = symbol;
	    this.priority = 0; // the higher the better
	    
	    this.useStorageAsSource = constants.SOURCE_USE_STORAGE;
	    this.useSourceAsSource = constants.SOURCE_USE_SOURCE;
	}
	
	/*
	 * Creates a single creep for this role.
	 */
    
    spawnCreep(spawn) {
    	return this.spawnCreepWithParts(spawn, [WORK, CARRY, MOVE, MOVE]);
    }

    /* 
     * Return true if a creep with this role would have work to do, 
     * i.e. if the role is currently _really_ necessary.
     * 
     * @param {Room} room 
     */
    
    isNecessary(room) {
        var targets = this.findTargets(room);
        return targets && targets.length > 0;
    }
    
    /* 
     * Returns the primary target for the creep, e.g. energy stores for harvester and 
     * construction sites for builders. 
     * 
     * @param {Room} room 
     */

    findTargets(room) {
        return [];
    }

    /* 
     * Returns the closest primary target for the creep, e.g. energy stores for harvester and 
     * construction sites for builders. 
     * 
     * @param {Creep} creep 
     */
    
    findClosestTarget(creep) {
        var targets = this.findTargets(creep.room);
        if (targets) {
        	targets = this.sortTargetForClosest(targets, creep);
        	return targets.length > 0 ? targets[0] : null;
		}
        return null;
    }

    /* 
     * Sorts the targets so the closest is first. If there are other
     * things to take into consideration, this function is overriden.
     * 
     * @param {Creep} creep 
     */
    
    sortTargetForClosest(targets, creep) {
        return targets.sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b));
    }

    /* 
     * Moves a creep to its closest primary target, e.g. energy stores for harvester and 
     * construction sites for builders. 
     * 
     * @param {Creep} creep 
     * @param function the work that should be done there
     */

    moveToClosestTarget(creep, work) {
    	var target = this.findClosestTarget(creep);
    	
    	if (!target) return;
    	
    	var workResult = work(target);
        if (workResult == ERR_NOT_IN_RANGE) {
            if (creep.memory.debug) {      
                info.log(creep.memory.role + ' is moving to target ' + target.id);  
            }
        	this.moveToLocation(creep, target);
        } else if (workResult == OK) {     
            if (creep.memory.debug) {
                info.log(creep.memory.role + ' is working on target ' + target.id);  
            }
        } else {      
        	this.handleTargetWorkResult(creep, workResult);
        }
    }  

    /* 
     * Handles result of work on target.
     * 
     * @param {Creep} creep 
     * @param work result
     */

    handleTargetWorkResult(creep, workResult) {
    	info.log(creep.memory.role + ' cannot work: ' + workResult);  
    }
    
    /* 
     * Moves a creep to a location. 
     * 
     * @param {Creep} creep 
     * @param location
     */
    
    moveToLocation(creep, location) {
    	creep.moveTo(location, {visualizePathStyle: {stroke: this.color}});
    }

    /* 
     * Moves a creep to a source. 
     * 
     * @param {Creep} creep 
     */

    moveToClosestSource(creep) {
        var source = this.findClosestSource(creep);
        
    	if (!source) return;
    	
    	var harvestResult = source.structureType ? creep.withdraw(source, RESOURCE_ENERGY) : creep.harvest(source);
        if (harvestResult == ERR_NOT_IN_RANGE) {
            if (creep.memory.debug) {      
                info.log(creep.memory.role + ' is moving to source ' + source.id);  
            }
            this.moveToLocation(creep, source);
        } else if (harvestResult == OK) {     
            if (creep.memory.debug) {
                info.log(creep.memory.role + ' is harvesting from source ' + source.id);  
            }
        } else {      
            this.handleSourceWorkResult(creep, harvestResult);
        }
        return harvestResult;
    }

    /* 
     * Returns the closest source for the creep, e.g. sources or storages.
     * 
     * @param {Creep} creep 
     */
    
    findClosestSource(creep) {
        var sources = this.findSources(creep.room);
        if (sources) {
            sources = this.sortSourceForClosest(sources, creep);
            return sources.length > 0 ? sources[0] : null;
        }
        return null;
    }

    /* 
     * Sorts the sources so the closest is first. If there are other
     * things to take into consideration, this function is overriden.
     * 
     * @param {Creep} creep 
     */
    
    sortSourceForClosest(sources, creep) {
        return sources.sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b));
    }

    /* 
     * Returns the primary target for the creep, e.g. energy stores for harvester and 
     * construction sites for builders. 
     * 
     * @param {Room} room 
     */

    findSources(room) {
        var storages = this.useStorageAsSource ? room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE ||
                        structure.structureType == STRUCTURE_CONTAINER ||
                        structure.structureType == STRUCTURE_LINK) && 
                        structure.store.getCapacity(RESOURCE_ENERGY) > 0;
            }}) : [];
            
        var sources = this.useSourceAsSource ? room.find(FIND_SOURCES_ACTIVE, {
                filter: (source) => {
                    if (game.findAllCreeps().filter(creep => creep.memory.homeSource == source.id).length) {
                        // source was claimed by a miner
                        return false;
                    }
                    return source.energy > 0;
                }}) : [];
        
        return storages.concat(sources);
    }

    /* 
     * Handles result of harvest on source.
     * 
     * @param {Creep} creep 
     * @param harvest result
     */

    handleSourceWorkResult(creep, harvestResult) {
        info.log(creep.memory.role + ' cannot harvest: ' + harvestResult); 
    }
    
    /* 
     * Creep AI gets run. Creep might decide working is not in its best interest. 
     * 
     * @param {Creep} creep 
     */
    
    run(creep) {
        
        // self-destructing is more important than working
        
        if (creep.memory.selfdestruct) {
            this.selfdestruct(creep);
            return;
        }
        
        this.work(creep);
    }

    /* 
     * Creep self-destructs or tries to anyway.
     * 
     * @param {Creep} creep 
     */
    
    selfdestruct(creep) {
        var spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (spawn) {
            var recycleAnswer = spawn.recycleCreep(creep);
            if (recycleAnswer == ERR_NOT_IN_RANGE) {
                if (creep.memory.debug) {      
                    info.log(creep.memory.role + ' is moving to spawn ' + spawn.id);  
                }
                this.moveToLocation(creep, spawn);
            } else if (recycleAnswer == OK) {  
                if (creep.memory.debug) {
                    info.log(creep.memory.role + ' was recycled.');  
                }
            }
        } else {
            info.log('🛑 ' + creep.memory.role + ' could not find a spawn.');  
        }
    }

    /* 
     * Creep works. 
     * 
     * @param {Creep} creep 
     */
    
    work(creep) {
        // do nothing on default   
        creep.say('🛑 unimplemented');
    }
    
    /* 
     * Creep goes to source until full, then works till it's empty and starts over. 
     * 
     * @param {Creep} creep 
     * @param function the work that should be done there
     */
    
    commuteBetweenSourceAndTarget(creep, work) {
        if (creep.memory.working && creep.store.getUsedCapacity() == 0) {
            creep.memory.working = false;
        }
        if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
        }
    
        if (creep.memory.working) {
            this.moveToClosestTarget(creep, work);
        } else {
            this.moveToClosestSource(creep);
        }
    }

    /* 
     * Spawns a creep that has the needed parts (or many of them) and a single part of some other type.
     * 
     * @param {Spawn} spawn 
     * @param parts to duplicate
     * @param singleParts that are added as is
     */
    
    spawnCreepWithParts(spawn, parts, singleParts = []) {
        var parts = this.calculateMaxParts(spawn, parts, singleParts);
        if (parts) {
            var newName = this.roleName + ' ' + Game.time;
            var spawnResult = spawn.spawnCreep(parts, newName, { memory: {
                role: this.roleName,
                home: spawn.memory.home,
            }});
            if (spawnResult == OK) {
                return Game.creeps[newName];
            }
        }
        return false;
    }
    
    // after this point, the rest are only helper methods

    /* 
     * Calculate the max parts we can afford.
     * 
     * @param {Spawn} spawn 
     * @param parts to duplicate
     * @param singleParts that are added as is
     */
    
    calculateMaxParts(spawn, parts = [], singleParts = []) {
        var costs = this.calculateCostsForParts(parts);
        
        if (!costs) return null; // we can't spawn empty parts
        
        var singleCosts = singleParts ? this.calculateCostsForParts(singleParts) : 0;
        var multiplier = this.getPartsMinMultiplier(spawn);
        var partsMaxMultiplier = this.getPartsMaxMultiplier(spawn);
      
        while ((multiplier + 1) * costs + singleCosts <= spawn.room.energyAvailable && multiplier < partsMaxMultiplier) {
            multiplier++;
        }
        
        if (multiplier === 0) {
            // we can't spawn anything right now
            return null;
        }
        
        return singleParts ? singleParts.concat(this.replicateParts(parts, multiplier)) : this.replicateParts(parts, multiplier);
    }

    /* 
     * Returns the minimum multiplier for the parts for this role.
     * 
     * @param {Spawn} spawn 
     */
    
    getPartsMinMultiplier(spawn) {
        return (spawn.room.memory.base && spawn.room.memory.base.partsMinMultiplier) || 0;
    }

    /* 
     * Returns the maximum multiplier for the parts for this role.
     * 
     * @param {Spawn} spawn 
     */
    
    getPartsMaxMultiplier(spawn) {
        return (spawn.room.memory.base && spawn.room.memory.base.partsMaxMultiplier) || 20;
    }

    /* 
     * Calculates the costs for the parts in the array.
     * 
     * @param parts array
     */
    
    calculateCostsForParts(parts) {
        var result = 0;
        parts.forEach(part => result += this.calculateCostsForSinglePart(part));
        return result;
    }

    /* 
     * Calculates the costs for a single part.
     * 
     * @param part
     */
        
    calculateCostsForSinglePart(part) {
        return BODYPART_COST[part];
    }

    /* 
     * Creates a new array and puts the parts array in there a specific amount of times.
     * 
     * @param part array
     * @param multiplier how often to replicate the array
     */
    
    replicateParts(parts, multiplier) {
        var result = [];
        for (var i = 0; i < multiplier; i++) {
            result = result.concat(parts);
        }
        return result;
    }
    
};

module.exports = RolePrototype;