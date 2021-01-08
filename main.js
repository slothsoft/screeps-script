var info = require('main.info');

var minerExplorer = require('role.miner');

var baseManager = require('manager.base');

module.exports.loop = function () {

    var tower = Game.getObjectById('5ff55a31a435f9cd0078311a');
    if(tower) {

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        } else {
            
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if(closestDamagedStructure) {
                // takes waaaay too much energy
                tower.repair(closestDamagedStructure);
            }
            
        }
        
    }
    var tower = Game.getObjectById('5ff8c26eabeae4cd163c0adc');
    if(tower) {

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        } else {
            
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if(closestDamagedStructure) {
                // takes waaaay too much energy
                tower.repair(closestDamagedStructure);
            }
            
        }
        
    }
    
    // delete the memory of deceased creeps 

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    baseManager.runAll();
    info.print();
}

// some helper methods to make managing this thing more easily

/**
 * Prints the oldest creep with its ticks to live to the console.
 **/

fetchOldestCreep = function (baseName) {
    var oldestCreep;
    for (var creepName in Game.creeps) {
        var creep = Game.creeps[creepName];
        if ((!oldestCreep || creep.ticksToLive < oldestCreep.ticksToLive) && (!baseName || creep.room.memory.base.name == baseName)) { 
            oldestCreep = creep;
        }
    }
    if (oldestCreep) 
        info.log("Oldest creep: " + oldestCreep.name + " (" + oldestCreep.ticksToLive + " ttl)");
    else 
        info.log("No creep found.");
};

/**
 * Spawns a mimer for a specific source.
 **/
 
spawnMiner = function (spawnName, sourceName) { 
    if (!sourceName) {
        info.log("🛑 The source is mandatory!");
        return;
    }
    var spawn = Game.spawns[spawnName];
    if (!spawn) {
        info.log("🛑 Could not find spawn: " + spawnName);
        return;
    }
    var resultingCreep = minerExplorer.spawnCreep(spawn);
    if (resultingCreep) {
        info.log(minerExplorer.symbol + ' Spawning new ' + minerExplorer.roleName + ' (' + resultingCreep.body.length + 'p)');
        resultingCreep.memory.homeSpawn = spawnName;
        resultingCreep.memory.homeSource = sourceName;
        return resultingCreep;
    }
    return resultingCreep;
};

/**
 * Moves the creep back to a spawn and self-destructs it.
 **/
 
selfdestruct = function (creepName) { 
    var creep = Game.creeps[creepName];
    if (!creep) {
        info.log("🛑 Could not find creep: " + creepName);
        return;
    }
    creep.memory.selfdestruct = true;
};
