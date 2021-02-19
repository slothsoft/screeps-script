/*
 * The main loop of the game. 
 */

var MainUtil = require('./main.util');
var MainInfo = require('./main.info');

var BaseManager = require('./manager.base');
var CpuManager = require('./manager.cpu');
var LinkManager = require('./manager.link');
var MayorManager = require('./manager.mayor');
var MemoryManager = require('./manager.memory');
var RoadManager = require('./manager.road');
var RoomManager = require('./manager.room');
var TowerManager = require('./manager.tower');

var Explorer = require('./role.explorer');
var Miner = require('./role.miner');

var TileArray = require('./tile.array');

module.exports.loop = function () {
    
    // init all necessary information

	var allRoles = BaseManager.fetchAllRoles();
	CpuManager.initRound();
	CpuManager.measure('initRound()', () => MemoryManager.initRound(allRoles));
    
    // run the entire base
    
	CpuManager.measure('BaseManager', BaseManager.runAll);
	CpuManager.measure('TowerManager', TowerManager.runAll);
	CpuManager.measure('LinkManager', LinkManager.runAll);
	CpuManager.measure('RoadManager', RoadManager.watchAllRooms);
	CpuManager.measure('MayorManager', MayorManager.runAll);
	   
    // print GUI on top
    
    MainInfo.visualize();
    CpuManager.visualize();
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

/*
 * Creates the editable layout in the memory of the room. Will override previous layouts.
 * 
 * @param roomName 
 * @param array {TileArray} (or nothing)
 */

global.generateLayoutForRoom = function (roomName, array = new TileArray(50, 50)) {
	var room = Game.rooms[roomName];
    if (room) {
    	var layout = RoomManager.generateLayoutForRoom(room, array);
        return layout.replace(/.{50}/, "$1\n");
    } 
    MainInfo.error('Could not find room: ' + roomName);
    return false;
};
