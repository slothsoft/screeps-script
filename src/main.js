/*
 * The main loop of the game. 
 */

var game = require('./main.game');
var info = require('./main.info');

var BaseManager = require('./manager.base');
var linkManager = require('./manager.link');
var MemoryManager = require('./manager.memory');

var Explorer = require('./role.explorer');
var Miner = require('./role.miner');

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
                // tower.repair(closestDamagedStructure);
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
                // tower.repair(closestDamagedStructure);
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
    
    // init all necessary information

	var allRoles = BaseManager.fetchAllRoles();
	MemoryManager.initRound(allRoles);
    
    // run the entire base
    
    game.findAllRooms().forEach(room => new BaseManager(room).runBase());
    linkManager.manageAll();
    
    // print GUI on top
    
    info.print();
}

// some helper methods to make managing this thing more easily

/*
 * Prints the oldest creep with its ticks to live to the console.
 * 
 * @param baseName
 */

global.fetchOldestCreep = function (baseName) {
    var oldestCreep = game.findAllCreeps().
    	filter(creep => (!baseName || creep.room.memory.home == baseName)).
    	sort((a, b) => { return a.ticksToLive - b.ticksToLive });
    
    if (oldestCreep.length > 0) {
        info.log('Oldest creep: ' + oldestCreep[0].name + ' (' + oldestCreep[0].ticksToLive + ' ttl)');
        return oldestCreep[0];
    } 
    info.error('No creep found.');
    return null;
};

/*
 * Spawns a miner for a specific source.
 * 
 * @param spawnId
 * @param sourceId
 */

global.spawnMiner = function (spawnId, sourceId) { 
    return new Miner().spawnCreepFromSpawnName(spawnId, sourceId);
};

/*
 * Spawns a explorer for a specific flag.
 * 
 * @param spawnId
 * @param flagName
 */

global.spawnExplorer = function (spawnId, flagName) { 
    return new Explorer().spawnCreepFromSpawnName(spawnId, flagName);
};


/*
 * Moves the creep back to a spawn and self-destructs it.
 * 
 * @param creepName
 */
 
global.selfdestruct = function (creepName) { 
    var creep = Game.creeps[creepName];
    if (!creep) {
        info.error('Could not find creep: ' + creepName);
        return;
    }
    creep.memory.selfdestruct = true;
};
