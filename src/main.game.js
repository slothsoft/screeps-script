/*
 * These methods _really_ should be game methods, but oh well ¯\_(ツ)_/¯
 */

class MainGame {

	/*
	 * Finds all spawns in the game and puts them in an array.
	 */
    
    static findAllSpawns() {
        var result = [];
        for (var spawnName in Game.spawns) {
            result.push(Game.spawns[spawnName]);
        }
        return result;
    }
    
	/*
	 * Finds all creeps in the game and puts them in an array.
	 */
    
    static findAllCreeps() {
        var result = [];
        for (var creepName in Game.creeps) {
            result.push(Game.creeps[creepName]);
        }
        return result;
    }

	/*
	 * Finds all rooms in the game and puts them in an array.
	 */
    
    static findAllRooms() {
        var result = [];
        for (var roomName in Game.rooms) {
            result.push(Game.rooms[roomName]);
        }
        return result;
    }

	/*
	 * Finds all flags in the game and puts them in an array.
	 */
    
	static findAllFlags() {
	    var result = [];
	    for (var flagName in Game.flags) {
	        result.push(Game.flags[flagName]);
	    }
	    return result;
	}

	/*
	 * Returns the display name of a game object.
	 * 
	 * @param game object
	 */
    
	static getDisplayName(gameObject) {
	    if (gameObject.name) {
	    	return gameObject.name;
	    }
	    if (gameObject.memory && gameObject.memory.name) {
	    	return gameObject.memory.name;
	    }
	    if (gameObject.id) {
	    	return gameObject.id;
	    }
	    return JSON.stringify(gameObject);
	}

}

module.exports = MainGame;