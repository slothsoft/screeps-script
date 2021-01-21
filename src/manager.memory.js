/*
 * This manager initializes and manages the memory of all kinds of different objects.
 * 
 * TODO: maybe memory could be stored closer to where it is used?
 */
 
var game = require('./main.game');

class MemoryManager {

	/*
	 * Fetches the memory of all the room's role configs.
	 * 
	 * @param allRoles
	 */

	static fetchAllRoomRoleConfigs(allRoles) {
		game.findAllRooms().forEach(room => this.fetchRoomRoleConfig(room, allRoles));
	}
	
	/*
	 * Fetches the memory of the room's role config.
	 * 
	 * @param {Room} room
	 * @param allRoles
	 */

	static fetchRoomRoleConfig(room, allRoles) {
		var defaultArray = {
			partsMinMultiplier: 0,
			partsMaxMultiplier: 20,
		};
        allRoles.forEach(role => {
        	defaultArray[role.roleName] = { requiredNumber: 0 };
        });
		
		if (room.memory.base.roleConfig) {
			room.memory.base.roleConfig = Object.assign(defaultArray, room.memory.base.roleConfig);
		} else {
			room.memory.base.roleConfig = defaultArray;
		}
		return room.memory.base.roleConfig;
	}

	/*
	 * Fetches the memory of a room's base.
	 * 
	 * @param {Room} room
	 * @param baseName
	 */	

	static fetchRoomBase(room, baseName) { 
		var defaultArray = {
	         name : baseName,
	    };
		
		if (room.memory.base) {
			room.memory.base = Object.assign(defaultArray, room.memory.base);
		} else {
			room.memory.base = defaultArray;
    		// TODO: why doesn't variable work here?
			require('./main.info').log('🏠 Created new base: ' + baseName);
		}
		return room.memory.base;
	}

	/*
	 * Clears the memory of the all the room's infos.
	 * 
	 * @param allRoles
	 */
	
	static clearAllRoomRoleInfos(allRoles) {
		game.findAllRooms().forEach(room => this.clearRoomRoleInfo(room, allRoles));
	}

	/*
	 * Clears the memory of the room's role info.
	 * 
	 * @param {Room} room
	 * @param allRoles
	 */
	
	static clearRoomRoleInfo(room, allRoles) {
		var defaultArray = {};
        allRoles.forEach(role => {
        	defaultArray[role.roleName] = { 
                    symbol: role.symbol,
                    currentNumber: 0,
                    requiredNumber: this.getRequiredNumberForRoomAndRole(room, role),
        	};
        });
		room.memory.roleInfo = defaultArray;
		return room.memory.roleInfo;
	}

    /*
     * Gets the required number for a room and a role.
     * 
     * @param {Room} room
     * @param role
     */
    
	static getRequiredNumberForRoomAndRole(room, role) {
    	var hasBase = room.memory.base;
    	return hasBase 
    				? (room.memory.base.roleConfig && room.memory.base.roleConfig[role.roleName] ? room.memory.base.roleConfig[role.roleName].requiredNumber : 0) 
    				: -1;
    }


	/*
	 * Initializes all memories for this round.
	 *
	 * @param allRoles
 	 */	

	static initRound(allRoles) {  
		this.initSpawns();

    	this.fetchAllRoomRoleConfigs(allRoles);
    	this.clearAllRoomRoleInfos(allRoles);
    	
    	this.deleteUnusedMemory();
	}

	/*
	 * Initializes the very first base.
	 */	

	static initSpawns() {  
	    // all spawns (and all creeps) have a home, so that we find them again
	    
	    game.findAllSpawns().filter(spawn => !spawn.memory.home).forEach(spawn => {
	    	if (spawn.room.memory.base) {
	    		// 2nd spawn in a room
	    		spawn.memory.home = spawn.room.memory.base.name;
	    		// TODO: why doesn't variable work here?
	    		require('./main.info').log('🏠 Created new spawn in base: ' + spawn.room.memory.home);
	    	} else {
	    		// new base in this room
	    		this.fetchRoomBase(spawn.room, spawn.name);
	    		spawn.memory.home = spawn.room.memory.base.name;
	    	}
	    });
	}

    /*
     * Delete the memory of deceased creeps.
     */ 

	static deleteUnusedMemory() {  
	    for (var name in Memory.creeps) {
	        if (!Game.creeps[name]) {
	        	var debug = Memory.creeps[name].debug;
	            delete Memory.creeps[name];
	            if (debug) {
		    		// TODO: why doesn't variable work here?
		            require('./main.info').log('🚮 Clearing non-existing creep memory: ' + name);
	        	}
	        }
	    }
	}

};

module.exports = MemoryManager;