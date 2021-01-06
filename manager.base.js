/*
 * A base is a "virtual" construct. It most closely resembles a "room".
 * To configure a base, the first spawn is marked as such. To create more 
 * then one base, all further have to be marked manually?
 */
 
var game = require('main.game');
var constants = require('main.constants');
var info = require('main.info');

var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleHandyman = require('role.handyman');
var allRoles = [roleHarvester, roleBuilder, roleUpgrader, roleHandyman];

var result = {
    
    runAll: function() {  
        this.init();
        
        for (var roomName in Game.rooms) {
            this.runBase(Game.rooms[roomName]);
        }
    },
    
    init: function() {  
        var initialSpawn;
        
        for (var spawnName in Game.spawns) {
            initialSpawn = Game.spawns[spawnName];
            break;
        }
        
        if (!initialSpawn) {
            return; // nothing has happened yet
        }
        
            
        if (game.getSpawnCount() == 1 && !initialSpawn.room.memory.base) {
            // Congratz! We just spawned our very first base!
            initialSpawn.room.memory.base = {
                 name : "Dresden", // the best city ever
            };
            console.log("Created new base: " + initialSpawn.room.memory.base.name);
        }
        
        // all spawns (and all creeps) have a home, so that we find them again
        
        for (var spawnName in Game.spawns) {
            var spawn = Game.spawns[spawnName];
            if (!spawn.memory.home) {
                spawn.memory.home = initialSpawn.room.memory.base.name;
            }
        }
    },
    
    runBase: function(room) {  
        this.initRoleInfo(room);
        this.repopulateCreeps(room);
        this.showSpawningAnimation();
        this.moveCreeps(room);
    },
    
    
    /** Test for each role if enough creeps are present (else create them) */

    repopulateCreeps: function(room) {    
        allRoles.forEach(role => {
            var baseName = room.memory.base.name;
            var foundCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role.roleName && creep.memory.home == baseName);
            
            if (foundCreeps.length < room.memory.base.roleInfo[role.roleName].requiredNumber) {
                var freeSpawn = this.fetchFreeSpawn(room);
                if (freeSpawn) {
                    if (role.spawnCreep(freeSpawn)) {
                        console.log('Spawning new creep: ' + newName);
                    }
                }
            }
        });
    },
    
    fetchFreeSpawn: function(room) {  
        for (var spawnName in Game.spawns) {
            var spawn = Game.spawns[spawnName];
            if (spawn.memory.home == room.memory.base.name && !spawn.spawning) {
                return spawn;
            }
        }
        return null;
    },  
        
    /**
     * show spawning "animation"
     **/
    
    showSpawningAnimation: function() {  
        for (var spawnName in Game.spawns) {
            var spawn = Game.spawns[spawnName];
            if (spawn.spawning) { 
                var spawningCreep = Game.creeps[spawn.spawning.name];
                spawn.room.visual.text('🔁', spawn.pos.x - 1, spawn.pos.y, {align: 'center', opacity: 0.8});
            }
        }
    },
    
    /**
     * Move the creeps around
     **/
    
    moveCreeps: function(room) {  
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            
            if (creep.room != room) {
                continue;
            }
            
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
                creep.room.memory.base.roleInfo[usedCreepRole.roleName].currentNumber++;
                
                if (constants.DEBUG_ROLES) {
                    creep.room.visual.text(usedCreepRole.symbol, creep.pos.x, creep.pos.y, {align: 'left', opacity: 0.8});
                }
                
                
            } else {
                // if no role could be found for a creep... he gets to be a harvester
                console.log("COULD NOT FIND ROLE: " + creep.memory.role);
                roleHarvester.run(creep);
            }
        }
    },
    
    /**
     * Init role info on room, so we can print it (or do whatever)
     **/

    initRoleInfo: function(room) {  
        var currentRoleInfo = { }; 
        
        for (var roleIndex in allRoles) {
            var role = allRoles[roleIndex];
            var originalRoleInfo = room.memory.base.roleInfo && room.memory.base.roleInfo[role.roleName];
            currentRoleInfo[role.roleName] = {
                symbol: role.symbol,
                requiredNumber: (originalRoleInfo && originalRoleInfo.requiredNumber) || role.requiredNumber,
                currentNumber: 0,
            };
        }
        room.memory.base.roleInfo = currentRoleInfo;
    },

};

module.exports = result;