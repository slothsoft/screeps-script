/*
 * This class knows ALL roles. And is able to switch creeps bitween them if necessary.
 */
 
var constants = require('main.constants');

var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleHandyman = require('role.handyman');
var allRoles = [roleHarvester, roleBuilder, roleUpgrader, roleHandyman];


var result = {
    
    
    /** Test for each role if enough creeps are present (else create them) */

    repopulateCreeps: function() {    
        // TODO: maybe use renewCreep() instead?
        // TODO: maybe use renewCreep for big creeps only?
        allRoles.forEach(role => {
            var foundCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role.roleName);
            
            if (foundCreeps.length < role.requiredNumber && !Game.spawns['Spawn1'].spawning) {
                // TODO: only spawn creep if it is really necessary
                var newName = role.roleName + ' ' + Game.time;
                // TODO: do not always use spawn1
                if (role.spawnCreep(Game.spawns['Spawn1'], newName)) {
                    console.log('Spawning new creep: ' + newName);
                }
            }
        });
    },
    
    // Move the creeps around
    
    moveCreeps: function() {  
        // TODO: not all on the same resource
    
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            var creepRole = _.filter(allRoles, (role) => creep.memory.role == role.roleName);
            
            if(creepRole.length > 0) {
                var usedCreepRole = creepRole[0];
                
                if (!usedCreepRole.isNecessary(creep.room)) {
                    // we have creeps in a role that is not necessary - try to find something better to do
                    var necessaryRole = _.filter(allRoles, (role) => role.isNecessary(creep.room));
                    if (necessaryRole.length > 0) {
                        usedCreepRole = necessaryRole[0];
                    }
                }
                usedCreepRole.run(creep);
                
                if (constants.DEBUG_ROLES) {
                    creep.room.visual.text(usedCreepRole.symbol, creep.pos.x, creep.pos.y, {align: 'left', opacity: 0.8});
                }
            } else {
                // if no role could be found for a creep... he gets to be a harvester
                console.log("COULD NOT FIND ROLE: " + creep.memory.role);
                roleHarvester.run(creep);
            }
        }
    }

};

module.exports = result;