/*
 * This module is used to display some information to the screen, so debugging is easier.
 */
 
var MainUtil = require('./main.util');

class MainInfo {

    /*
	 * Displays the collected information on the screen.
	 */
    
	static visualize() {   
		MainUtil.findAllRooms().forEach(room => {
            this._visualizeRoleInfos(room);
            this._visualizeConsole(room);
        });
    }

    /*
	 * Displays the role infos for a specific room on the screen.
	 * 
	 * @param {Room} room
	 */
    
	static _visualizeRoleInfos(room) {   
        if (!room.memory.roleInfo)
            return;

    	var console = MainInfo._fetchMemoryOfRoomConsole(room);
        var x = console.roleInfoX;
        var y = console.roleInfoY;
        
        var roomName = (room.memory.base && room.memory.base.name) || room.name;
        room.visual.text(roomName + '    ' + room.energyAvailable + '/' + room.energyCapacityAvailable + '🟡', x, y++, {align: 'left', opacity: console.opacity});
        
        var unusedRoles = '';
        
        for (const role in room.memory.roleInfo) {
            var count = room.memory.roleInfo[role];
            if (count.currentNumber || (count.requiredNumber > 0)) {
            	var ofRequired = count.requiredNumber >= 0 ? '/' + count.requiredNumber : '';
                room.visual.text(count.symbol + ' ' + role + ' ' + count.currentNumber + ofRequired, x, y++, {align: 'left', opacity: console.opacity});
            } else {
                unusedRoles += count.symbol;
            }
        }
        
        if (unusedRoles) {
        	var ofRequired = room.memory.base ? '/0' : '';
        	room.visual.text(unusedRoles + ' 0' + ofRequired, x, y++, {align: 'left', opacity: console.opacity});
        }
    }

	/*
	 * Fetches the memory of the room's console.
	 * 
	 * @param {Room} room
	 */
	
	static _fetchMemoryOfRoomConsole(room) {
		var defaultArray = {
			x: 30,
			y: 0,
			height: 49,
			roleInfoX: 0,
			roleInfoY: 0,
			opacity: 0.8,
		};
		if (room.memory.console) {
			room.memory.console = Object.assign(defaultArray, room.memory.console);
		} else {
			room.memory.console = defaultArray;
		}
		return room.memory.console;
	}

    /*
	 * Displays the console for a specific room on the screen.
	 * 
	 * @param {Room} room
	 */
    
	static _visualizeConsole(room) {   
    	var console = this._fetchMemoryOfRoomConsole(room);
        var x = console.x;
        var xLine = x + 5;
        var yMin = console.y;
        var height = console.height;
        var y = yMin + height;

        var wasDrawn = false;
        
        for (const lineIndex in this._lines) {
        	var lineRoom = this._lineRooms[lineIndex];
        	if (lineRoom && lineRoom != room) {
        		continue;
        	}
        	
            var time = this._lineTimes[lineIndex];
            room.visual.text(time.toISOString().substring(2, 16).replace('T', ' '), x, y, {align: 'left'});
            
            room.visual.text(this._lines[lineIndex], xLine, y, {align: 'left'});
            
            wasDrawn = true;
            y--;
            if (y <= yMin) {
                break;
            }
        }
        
        if (!wasDrawn) {
            room.visual.text('<no console entries>', xLine, y, {align: 'left', opacity: console.opacity});
        } 
    }

    /*
	 * Clears the UI console.
	 */
    
	static clearLines() {   
        this._lineTimes = [];
        this._lines = [];
        this._lineRooms = [];
    }
    
    /*
	 * Logs the string to the UI console.
	 * 
	 * @param the new line
	 * @param {Room} room
	 */
    
	static log(newLine, room) {   
        if (newLine === 'object' && newLine !== null) {
            console.log(JSON.stringify(newLine));
        } else {
        	console.log(newLine);
        }
        var height = this.getMaxHeight();
        
        this._lineTimes.splice(0, 0, new Date());
        this._lineTimes = this._lineTimes.slice(0, height);
        
        this._lines.splice(0, 0, newLine);
        this._lines = this._lines.slice(0, height);
        
        this._lineRooms.splice(0, 0, room);
        this._lineRooms = this._lineRooms.slice(0, height);
    }

    /*
	 * Logs the error to the UI console.
	 * 
	 * @param the new line
	 * @param {Room} room
	 */
    
	static error(newLine, room) {   
        this.log('🛑 ' + newLine, room);
    }

    /*
	 * Logs the warning to the UI console.
	 * 
	 * @param the new line
	 * @param {Room} room
	 */

	static warning(newLine, room) {   
        this.log('⚠ ' + newLine, room);
    }

    /*
	 * Returns the max console height for all rooms.
	 * 
	 * @param the new line
	 */
    
	static getMaxHeight() {   
        var result = Math.max(MainUtil.findAllRooms().map(room => (room.memory.console && room.memory.console.height)));
        return result || 10;
    }

	static getLine(index) {
    	return this._lines[index];
    }
    
	static getLines() {
    	return this._lines;
    }
};

MainInfo._lineTimes = [];
MainInfo._lines = [];
MainInfo._lineRooms = [];

module.exports = MainInfo;