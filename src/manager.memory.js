/*
 * This manager initializes and manages the memory of all kinds of different objects.
 * 
 * TODO: maybe memory could be stored closer to where it is used?
 */
 
var MainUtil = require('./main.util');
var info = require('./main.info');

class MemoryManager {

	/*
	 * Fetches the memory of the room's role config for a specific base name.
	 * 
	 * @param {Room} room
	 * @param allRoles - the roles to be initialized
	 */
	
	static fetchRoomRoleConfigForBase(baseName, allRoles = []) {
		var roomsOfBase = MainUtil.findAllRooms().filter(room => room.memory.base && room.memory.base.name === baseName);
		if (roomsOfBase.length > 0) {
			return this._fetchRoomRoleConfig(roomsOfBase[0], allRoles);
		}
		return null;
	}
	
	/*
	 * Fetches the memory of all the room's role configs.
	 * 
	 * @param allRoles
	 */

	static _fetchAllRoomRoleConfigs(allRoles) {
		MainUtil.findAllRooms().forEach(room => {
			if (room.memory.base) {
				this._fetchRoomRoleConfig(room, allRoles);
			}
		});
	}
	
	/*
	 * Fetches the memory of the room's role config.
	 * 
	 * @param {Room} room
	 * @param allRoles - the roles to be initialized
	 */

	static _fetchRoomRoleConfig(room, allRoles = []) {
		var defaultArray = {
			partsMinMultiplier: 0,
			partsMaxMultiplier: 5,
			showIcons: true,
	    	useStorageAsSource: true,
	    	useSourceAsSource: true,
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
			info.log('🏠 Created new base: ' + baseName);
		}
		return room.memory.base;
	}

	/*
	 * Clears the memory of the all the room's infos.
	 * 
	 * @param allRoles
	 */
	
	static _clearAllRoomRoleInfos(allRoles) {
		MainUtil.findAllRooms().forEach(room => this._clearRoomRoleInfo(room, allRoles));
	}

	/*
	 * Clears the memory of the room's role info.
	 * 
	 * @param {Room} room
	 * @param allRoles
	 */
	
	static _clearRoomRoleInfo(room, allRoles) {
		var defaultArray = {};
        allRoles.forEach(role => {
        	defaultArray[role.roleName] = { 
                    symbol: role.symbol,
                    currentNumber: 0,
                    requiredNumber: this.getRequiredNumberForRoomAndRole(room, role.roleName),
        	};
        });
		room.memory.roleInfo = defaultArray;
		return room.memory.roleInfo;
	}

    /*
     * Gets the required number for a room and a role.
     * 
     * @param {Room} room
     * @param roleName
     */
    
	static getRequiredNumberForRoomAndRole(room, roleName) {
    	var hasBase = room.memory.base;
    	return hasBase 
    				? (room.memory.base.roleConfig && room.memory.base.roleConfig[roleName] ? room.memory.base.roleConfig[roleName].requiredNumber : 0) 
    				: -1;
    }


	/*
	 * Initializes all memories for this round.
	 *
	 * @param allRoles
 	 */	

	static initRound(allRoles) {  
		this._initSpawns();

    	this._fetchAllRoomRoleConfigs(allRoles);
    	this._clearAllRoomRoleInfos(allRoles);
    	
    	this._deleteUnusedMemory();
	}

	/*
	 * Initializes the very first base.
	 */	

	static _initSpawns() {  
	    // all spawns (and all creeps) have a home, so that we find them again
	    
	    MainUtil.findAllSpawns().filter(spawn => !spawn.memory.home).forEach(spawn => {
	    	if (spawn.room.memory.base) {
	    		// 2nd spawn in a room
	    		spawn.memory.home = spawn.room.memory.base.name;
	    		info.log('🏠 Created new spawn in base: ' + spawn.memory.home);
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

	static _deleteUnusedMemory() {  
	    for (var name in Memory.creeps) {
	        if (!Game.creeps[name]) {
	        	var debug = Memory.creeps[name].debug;
	            delete Memory.creeps[name];
	            if (debug) {
	            	info.log('🚮 Clearing non-existing creep memory: ' + name);
	        	}
	        }
	    }
	}

};

module.exports = MemoryManager;