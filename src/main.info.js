/*
 * This module is used to display some information to the screen, so debugging is easier.
 */
 
// TODO: print -> visualize ?
// TODO: generally make methods more consistent
// TODO: this class is not really a class - it's a singleton of sorts?

var constants = require('./main.constants');
var game = require('./main.game');

class MainInfo {

	/*
	 * Fetches the memory of the room's console.
	 * 
	 * @param {Room} room
	 */
	
	/* static */ fetchMemoryOfRoomConsole(room) {
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
	
	constructor() {
		this._lineTimes = [];
		this._lines = [];
	}
    
    /*
	 * Displays the collected information on the screen.
	 */
    
	visualize() {   
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            this._visualizeRoleInfos(room);
            this._visualizeConsole(room);
        }
    }

    /*
	 * Displays the role infos for a specific room on the screen.
	 * 
	 * @param {Room} room
	 */
    
    _visualizeRoleInfos(room) {   
        if (!room.memory.roleInfo)
            return;

    	var console = this.fetchMemoryOfRoomConsole(room);
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
	 * Displays the console for a specific room on the screen.
	 * 
	 * @param {Room} room
	 */
    
    _visualizeConsole(room) {   
    	var console = this.fetchMemoryOfRoomConsole(room);
        var x = console.x;
        var xLine = x + 5;
        var yMin = console.y;
        var height = console.height;
        var y = yMin + height;
        
        if (this._lines.length == 0) {
            room.visual.text('<no console entries>', x, y, {align: 'left', opacity: console.opacity});
        } else {
            for (const lineIndex in this._lines) {
                var time = this._lineTimes[lineIndex];
                room.visual.text(time.toISOString().substring(2, 16).replace('T', ' '), x, y, {align: 'left'});
                room.visual.text(this._lines[lineIndex], xLine, y, {align: 'left'});
                
                y--;
                if (y <= yMin) {
                    break;
                }
            }
        }
    }

    /*
	 * Clears the UI console.
	 */
    
    clearLines() {   
        this._lineTimes = [];
        this._lines = [];
    }
    
    /*
	 * Logs the string to the UI console.
	 * 
	 * @param the new line
	 */
    
    log(newLine) {   
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
    }

    /*
	 * Logs the error to the UI console.
	 * 
	 * @param the new line
	 */
    
    error(newLine) {   
        this.log('🛑 ' + newLine);
    }

    /*
	 * Logs the warning to the UI console.
	 * 
	 * @param the new line
	 */
    

    warning(newLine) {   
        this.log('⚠ ' + newLine);
    }

    /*
	 * Returns the max console height for all rooms.
	 * 
	 * @param the new line
	 */
    
    getMaxHeight() {   
        var result = Math.max(game.findAllRooms().map(room => (room.memory.console && room.memory.console.height)));
        return result || 10;
    }

    getLine(index) {
    	return this._lines[index];
    }
    
    getLines() {
    	return this._lines;
    }
};

module.exports = new MainInfo();