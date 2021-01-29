/*
 * The main loop of the game. 
 */

var MainUtil = require('./main.util');
var MainInfo = require('./main.info');

var BaseManager = require('./manager.base');
var LinkManager = require('./manager.link');
var MayorManager = require('./manager.mayor');
var MemoryManager = require('./manager.memory');
var RoadManager = require('./manager.road');
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
    LinkManager.runAll();
	RoadManager.watchAllRooms();
	MayorManager.runAll();
    
    // print GUI on top
    
    MainInfo.visualize();
}

// some helper methods to make managing this thing more easily

/*
 * Prints the oldest creep with its ticks to live to the console.
 * 
 * @param baseName
 */

global.fetchOldestCreep = function (baseName) {
    var oldestCreep = MainUtil.findAllCreeps().
    	filter(creep => (!baseName || creep.room.memory.home == baseName)).
    	sort((a, b) => { return a.ticksToLive - b.ticksToLive });
    
    if (oldestCreep.length > 0) {
        MainInfo.log('Oldest creep: ' + oldestCreep[0].name + ' (' + oldestCreep[0].ticksToLive + ' ttl)');
        return oldestCreep[0];
    } 
    MainInfo.error('No creep found.');
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
 * Spawns a specific role for a room
 * 
 * @param roomName
 * @param roleName
 */

global.spawnCreepForRoom = function (roomName, roleName) { 
	var room = Game.rooms[roomName];
    if (room) {
        return new BaseManager(room).spawnCreepForRoleName(roleName);
    } 
    MainInfo.error('Could not find room: ' + roomName);
    return false;
};

/*
 * Adds the type 'target' to the game object with the specified ID.
 * 
 * @param linkId
 */

global.makeLinkTarget = function (linkId) {
	LinkManager.makeLinkTarget(linkId);
};

/*
 * Adds the type 'source' to the game object with the specified ID.
 * 
 * @param linkId
 */

global.makeLinkSource = function (linkId) {
	LinkManager.makeLinkSource(linkId);
};

/*
 * Moves the creep back to a spawn and self-destructs it.
 * 
 * @param creepName
 */
 
global.selfdestruct = function (creepName) { 
    var creep = Game.creeps[creepName];
    if (!creep) {
        MainInfo.error('Could not find creep: ' + creepName);
        return;
    }
    creep.memory.selfdestruct = true;
};

/*
 * Moves the creep to a specific game object.
 * 
 * @param creepName
 * @param gameObjectId
 */
 
global.moveCreepTo = function (creepName, gameObjectId) { 
    var creep = Game.creeps[creepName];
    if (!creep) {
        MainInfo.error('Could not find creep: ' + creepName);
        return;
    }
    if (!Game.getObjectById(gameObjectId)) {
        MainInfo.error('Could not find game object: ' + gameObjectId);
        return;
    }
    creep.memory.moveToGameObject = gameObjectId;
};

/*
 * Clears the lines of the JavaScript and in-game consoles.
 */
 
global.clearConsole = function () { 
	MainInfo.clearLines();
};


