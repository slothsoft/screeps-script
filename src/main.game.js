/*
 * These methods _really_ should be game methods, but oh well ¯\_(ツ)_/¯
 */

var result = {

	/*
	 * Finds all spawns in the game and puts them in an array.
	 */
    
    findAllSpawns: function() {
        var result = [];
        for (var spawnName in Game.spawns) {
            result.push(Game.spawns[spawnName]);
        }
        return result;
    },
    
	/*
	 * Finds all creeps in the game and puts them in an array.
	 */
    
    findAllCreeps: function() {
        var result = [];
        for (var creepName in Game.creeps) {
            result.push(Game.creeps[creepName]);
        }
        return result;
    },

	/*
	 * Finds all rooms in the game and puts them in an array.
	 */
    
    findAllRooms: function() {
        var result = [];
        for (var roomName in Game.rooms) {
            result.push(Game.rooms[roomName]);
        }
        return result;
    },

};

module.exports = result;