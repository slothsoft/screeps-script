var info = require('main.info');

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

fetchOldestCreep = function (baseName) {
    var oldestCreep;
    for (var creepName in Game.creeps) {
        var creep = Game.creeps[creepName];
        if ((!oldestCreep || creep.ticksToLive < oldestCreep.ticksToLive) && (!baseName || creep.room.memory.base.name == baseName)) { 
            oldestCreep = creep;
        }
    }
    if (oldestCreep) 
        console.log("Oldest creep: " + oldestCreep.name + " (" + oldestCreep.ticksToLive + " ttl)");
    else 
        console.log("No creep found.");
};
