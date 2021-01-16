/*
 * This manager initializes and manages the memory of all kinds of different objects.
 */
 
class MemoryManager {

	/**
	 * Fetches the memory of the room's console.
	 * 
	 * @param {Room} room
	 */
	
	static fetchRoomConsole(room) {
		var defaultArray = {
			x: 40,
			y: 0,
			height: 50,
			roleInfoX: 0,
			roleInfoY: 0,
		};
		if (room.memory.console) {
			room.memory.console = Object.assign(defaultArray, room.memory.console);
		} else {
			room.memory.console = defaultArray;
		}
		return room.memory.console;
	}

	/**
	 * Fetches the memory of the room's role config.
	 * 
	 * @param {Room} room
	 * @param allRoles
	 */

	static fetchRoomRoleConfig(room, allRoles) {
		var defaultArray = {};
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
};

module.exports = MemoryManager;