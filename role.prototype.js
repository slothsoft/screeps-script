/**
 * This code is shared between the roles. It has standard behavior like:
 * - basic fields & methods
 * - moving to an appropriate source
 * - spawning new creeps
 * 
 * You need to implement / set
 * - roleName, requiredNumber
 * - (color, symbol)
 * - findTargets()
 * - work()
 */
 
const result = {
    
    roleName: 'XXX',
    requiredNumber: 0,
    color: '#ff0000',
    symbol: '❗',
    
    spawnCreep: function(spawn) {
    	this.spawnCreepWithParts(spawn, [WORK, CARRY, CARRY, MOVE]);
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
        	targets = _.sortBy(targets, t => creep.pos.getRangeTo(t));
        	return targets.length > 0 ? targets[0] : null;
		}
        return null;
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
    	
        if (target && work(target) == ERR_NOT_IN_RANGE) {
        	this.moveToLocation(creep, target);
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
        var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            this.moveToLocation(creep, source);
        }
    },

    
    /** 
     * Creep AI gets run. Creep might decide working is not in its best interest. 
     * 
     * @param {Creep} creep 
     **/
    
    run: function(creep) {
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
     * Spawns a creep that has the needed parts (or many of them).
     * 
     * @param {Spawn} spawn 
     **/
    
    spawnCreepWithParts: function(spawn, parts) {
        var newName = this.roleName + ' ' + Game.time;
        var parts = this.calculateMaxParts(spawn, parts);
        if (parts) {
            spawn.spawnCreep(parts, newName, {memory: {
                role: this.roleName,
                home: spawn.memory.home,
            }});
            return true;
        }
        return false;
    },
    
    // after this point, the rest are only helper methods
    
    calculateMaxParts: function(spawn, parts) {
        var costs = this.calculateCostsForParts(parts);
        var multiplier = 0;
      
        while ((multiplier + 1) * costs <= spawn.room.energyAvailable) {
            multiplier++;
        }
        
        if (multiplier === 0) {
            // we can't spawn anything right now
            return null;
        }
        
        return this.replicateParts(parts, multiplier);
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