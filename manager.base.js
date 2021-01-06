/*
 * A base is a "virtual" construct. It most closely resembles a "room".
 * To configure a base, the first spawn is marked as such. To create more 
 * then one base, all further have to be marked manually?
 */
 
var game = require('main.game');

var result = {
    
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
        
        for (var spawnName in Game.spawns) {
            var spawn = Game.spawns[spawnName];
            if (!spawn.memory.home) {
                spawn.memory.home = initialSpawn.room.memory.base.name;
            }
        }
    },

};

module.exports = result;