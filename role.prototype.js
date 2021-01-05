/*
 * This code is shared between the roles. It has standard behavior like:
 * - basic fields & methods
 * - moving to an appropriate source
 * - spawning new creeps
 */
 
const result = {
    
    roleName: 'XXX',
    requiredNumber: 0,
    color: '#ff0000',
    symbol: '❗',
    
    /** @param {Room} room **/
    isNecessary: function(room) {
        return true; // let's assume the role is necessary
    },
    
    /** @param {Creep} creep **/
    run: function(creep) {
        // do nothing on default   
        creep.say('🔔 unimplemented');
    },
    
    /** @param {Spawn} spawn **/
    spawnCreepWithParts: function(spawn, parts) {
        var newName = this.roleName + ' ' + Game.time;
        var parts = this.calculateMaxParts(spawn, parts);
        if (parts) {
            spawn.spawnCreep(parts, newName, {memory: {role: this.roleName}});
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
    
    moveToSource: function(creep) {
        var sources = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        if(creep.harvest(sources) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources, {visualizePathStyle: {stroke: this.color}});
        }
    }

};

module.exports = result;