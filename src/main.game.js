/*
 * These methods _really_ should be game methods, but oh well ¯\_(ツ)_/¯
 */

var result = {

	/*
	 * Returns the number of spawns in a specific room. 
	 * 
     * @param {Room} room 
	 */
		
    getSpawnCount: function(room) {   
        var result = 0;
        for (var s in Game.spawns) result++;
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
    }
};

module.exports = result;