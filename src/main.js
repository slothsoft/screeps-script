/*
 * The main loop of the game. 
 */

var game = require('./main.game');
var info = require('./main.info');

var BaseManager = require('./manager.base');
var linkManager = require('./manager.link');
var MemoryManager = require('./manager.memory');
var TowerManager = require('./manager.tower');

var Explorer = require('./role.explorer');
var Miner = require('./role.miner');

module.exports.loop = function () {
    
    // init all necessary information

	var allRoles = BaseManager.fetchAllRoles();
	MemoryManager.initRound(allRoles);
    
    // run the entire base
    
	BaseManager.runAll();
	TowerManager.runAll();
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
