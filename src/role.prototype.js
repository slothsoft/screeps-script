/**
 * This code is shared between the roles. It has standard behavior like:
 * - basic fields & methods
 * - moving to an appropriate source
 * - spawning new creeps
 * - commuting between an source and a target
 * 
 * You need to implement / set
 * - roleName, requiredNumber
 * - (color, symbol)
 * - findTargets()
 * - work()
 */
 
var constants = require('main.constants');
var info = require('main.info');
var game = require('main.game');

const result = {
    
    roleName: 'XXX',
    requiredNumber: 0,
    color: '#ff0000',
    symbol: '❗',
    priority: 0, // the higher the better
    
    useStorageAsSource: constants.SOURCE_USE_STORAGE,
    useSourceAsSource: constants.SOURCE_USE_SOURCE,
    
    spawnCreep: function(spawn) {
    	return this.spawnCreepWithParts(spawn, [WORK, CARRY, MOVE, MOVE]);
    },

    /** 
     * Return true if a creep with this role would have work to do, 
     * i.e. if the role is currently _really_ necessary.
     * 
     * @param {Room} room 
     **/
    
    isNecessary: function(room) {
        var targets = this.findTargets(room);
        return targets && targets.length > 0;
    },
    
    /** 
     * Returns the primary target for the creep, e.g. energy stores for harvester and 
     * construction sites for builders. 
     * 
     * @param {Room} room 
     */

    findTargets: function(room) {
        return [];
    },

    /** 
     * Returns the closest primary target for the creep, e.g. energy stores for harvester and 
     * construction sites for builders. 
     * 
     * @param {Creep} creep 
     */
    
    findClosestTarget: function(creep) {
        var targets = this.findTargets(creep.room);
        if (targets) {
        	targets = this.sortTargetForClosest(targets, creep);
        	return targets.length > 0 ? targets[0] : null;
		}
        return null;
    },
    
    sortTargetForClosest: function(targets, creep) {
        return _.sortBy(targets, t => creep.pos.getRangeTo(t));
    },

    /** 
     * Moves a creep to its closest primary target, e.g. energy stores for harvester and 
     * construction sites for builders. 
     * 
     * @param {Creep} creep 
     * @param function the work that should be done there
     */

    moveToClosestTarget: function(creep, work) {
    	var target = this.findClosestTarget(creep);
    	
    	if (!target) return;
    	
    	var workResult = work(target);
        if (workResult == ERR_NOT_IN_RANGE) {
            if (creep.memory.debug) {      
                info.log(creep.memory.role + " is moving to target " + target.id);  
            }
        	this.moveToLocation(creep, target);
        } else if (workResult == OK) {     
            if (creep.memory.debug) {
                info.log(creep.memory.role + " is working on target " + target.id);  
            }
        } else {      
            info.log(creep.memory.role + " cannot work: " + workResult);  
        }
    },  

    /** 
     * Moves a creep to a location. 
     * 
     * @param {Creep} creep 
     * @param location
     */
    
    moveToLocation: function(creep, location) {
    	creep.moveTo(location, {visualizePathStyle: {stroke: this.color}});
    },

    /** 
     * Moves a creep to a source. 
     * 
     * @param {Creep} creep 
     */

    moveToSource: function(creep) {
        
        var storages = this.useStorageAsSource ? creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE ||
                            structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType == STRUCTURE_LINK) && 
                            structure.store.getCapacity(RESOURCE_ENERGY) > 0;
                }}) : [];
                
        var sources = this.useSourceAsSource ? creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
                filter: (source) => {
                    if (game.findAllCreeps().filter(creep => creep.memory.homeSource == source.id).length) {
                        // source was claimed by a miner
                        return false;
                    }
                    return source.energy > 0;
                }}) : [];
        
        var possibleSources = storages.concat(sources);
        
        _.sortBy(possibleSources, t => creep.pos.getRangeTo(t));
        var source = possibleSources.length == 0 ? null : possibleSources[0];
    	if (!source) return;
    	
    	var harvestResult = source.structureType ? creep.withdraw(source, RESOURCE_ENERGY) : creep.harvest(source);
        if (harvestResult == ERR_NOT_IN_RANGE) {
            if (creep.memory.debug) {      
                info.log(creep.memory.role + " is moving to source " + source.id);  
            }
            this.moveToLocation(creep, source);
        } else if (harvestResult == OK) {     
            if (creep.memory.debug) {
                info.log(creep.memory.role + " is harvesting from source " + source.id);  
            }
        } else {      
            info.log(creep.memory.role + " cannot harvest: " + harvestResult + " (" + source.id + ")");  
        }
    },

    
    /** 
     * Creep AI gets run. Creep might decide working is not in its best interest. 
     * 
     * @param {Creep} creep 
     **/
    
    run: function(creep) {
        
        // selfdestructing is more important than working
        
        if (creep.memory.selfdestruct) {
            var spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
            if (spawn) {
                var recycleAnswer = spawn.recycleCreep(creep);
                if (recycleAnswer == ERR_NOT_IN_RANGE) {
                    if (creep.memory.debug) {      
                        info.log(creep.memory.role + " is moving to spawn " + spawn.id);  
                    }
                    this.moveToLocation(creep, spawn);
                } else if (recycleAnswer == OK) {  
                    if (creep.memory.debug) {
                        info.log(creep.memory.role + " was recycled.");  
                    }
                }
            }
            return;
        }
        
        this.work(creep);
    },

    /** 
     * Creep works. 
     * 
     * @param {Creep} creep 
     **/
    
    work: function(creep) {
        // do nothing on default   
        creep.say('🔔 unimplemented');
    },
    
    
    /** 
     * Creep goes to source until full, then works till it's empty and starts over. 
     * 
     * @param {Creep} creep 
     * @param function the work that should be done there
     **/
    
    commuteBetweenSourceAndTarget: function(creep, work) {
        
        if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
        }
        if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
        }
    
        if (creep.memory.working) {
            this.moveToClosestTarget(creep, work);
        } else {
            this.moveToSource(creep);
        }
    },
    
    /** 
     * Spawns a creep that has the needed parts (or many of them).
     * 
     * @param {Spawn} spawn 
     * @param parts to duplicate
     **/
    
    spawnCreepWithParts: function(spawn, parts) {
        return this.spawnCreepWithPartsAndSingle(spawn, parts, []);
    },
    
    /** 
     * Spawns a creep that has the needed parts (or many of them) and a single part of some other type.
     * 
     * @param {Spawn} spawn 
     * @param parts to duplicate
     * @param singleParts that are added as is
     **/
    
    spawnCreepWithPartsAndSingle: function(spawn, parts, singleParts) {
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
    },
    
    // after this point, the rest are only helper methods
    
    calculateMaxParts: function(spawn, parts, singleParts) {
        var costs = this.calculateCostsForParts(parts);
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
    },
    
    getPartsMinMultiplier: function(spawn) {
        return spawn.room.memory.base.partsMinMultiplier || 0;
    },
    
    getPartsMaxMultiplier: function(spawn) {
        return spawn.room.memory.base.partsMaxMultiplier || 20;
    },
    
    calculateCostsForParts: function(parts) {
        var result = 0;
        parts.forEach(part => result += this.calculateCostsForSinglePart(part));
        return result;
    },
        
    calculateCostsForSinglePart: function(part) {
        if (part == WORK) {
            return 100;
        }
        return 50; // MOVE & CARRY
    },
    
    replicateParts: function(parts, multiplier) {
        var result = [];
        for (var i = 0; i < multiplier; i++) {
            result = result.concat(parts);
        }
        return result;
    },
    
};

module.exports = result;