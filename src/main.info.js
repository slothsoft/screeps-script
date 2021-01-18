/*
 * This module is used to display some information to the screen, so debugging is easier.
 */
 
// TODO: print -> visualize ?
// TODO: generally make methods more consistent

var constants = require('./main.constants');
var game = require('./main.game');

var MemoryManager = require('./manager.memory');

class MainInfo {
    
	constructor() {
		this.consoleTime = [];
		this.console = [];
	}
    
    /*
	 * Displays the collected information on the screen.
	 */
    
    print() {   
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            this.printRolesInfoForRoom(room);
            this.printConsole(room);
        }
    }

    /*
	 * Displays the role infos for a specific room on the screen.
	 * 
	 * @param {Room} room
	 */
    
    printRolesInfoForRoom(room) {   
        if (!room.memory.roleInfo)
            return;

    	var console = MemoryManager.fetchRoomConsole(room);
        var x = console.roleInfoX;
        var y = console.roleInfoY;
        
        var roomName = (room.memory.base && room.memory.base.name) || room.name;
        room.visual.text(roomName + '    ' + room.energyAvailable + '/' + room.energyCapacityAvailable + '🟡', x, y++, {align: 'left', opacity: 0.8});
        
        var unusedRoles = '';
        
        for (const role in room.memory.roleInfo) {
            var count = room.memory.roleInfo[role];
            if (count.currentNumber || (count.requiredNumber > 0)) {
            	var ofRequired = count.requiredNumber >= 0 ? '/' + count.requiredNumber : '';
                room.visual.text(count.symbol + ' ' + role + ' ' + count.currentNumber + ofRequired, x, y++, {align: 'left', opacity: 0.8});
            } else {
                unusedRoles += count.symbol;
            }
        }
        
        if (unusedRoles) {
        	var ofRequired = room.memory.base ? '/0' : '';
        	room.visual.text(unusedRoles + ' 0' + ofRequired, x, y++, {align: 'left', opacity: 0.8});
        }
    }

    /*
	 * Displays the console for a specific room on the screen.
	 * 
	 * @param {Room} room
	 */
    
    printConsole(room) {   
    	var console = MemoryManager.fetchRoomConsole(room);
        var x = console.x;
        var xLine = x + 5;
        var yMin = console.y;
        var height = console.height;
        var y = yMin + height;
        
        if (this.console.length == 0) {
            room.visual.text('<no console entries>', x, y, {align: 'left', opacity: 0.8});
        } else {
            for (const lineIndex in this.console) {
                var time = this.consoleTime[lineIndex];
                room.visual.text(time.toISOString().substring(2, 16).replace('T', ' '), x, y, {align: 'left'});
                room.visual.text(this.console[lineIndex], xLine, y, {align: 'left'});
                
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
    
    clearLog() {   
        this.consoleTime = [];
        this.console = [];
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
        
        this.consoleTime.splice(0, 0, new Date());
        this.consoleTime = this.consoleTime.slice(0, height);
        
        this.console.splice(0, 0, newLine);
        this.console = this.console.slice(0, height);
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
};

module.exports = new MainInfo();