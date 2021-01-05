/*
 * This code is shared between the roles
 */
 
var result = {
    
    /** @param {Spawn} spawn **/
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
        
    /** @param {Part} part **/
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