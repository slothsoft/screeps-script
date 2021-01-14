/*
 * This module is used to display some information to the screen, so debugging is easier.
 */
 
// TODO: print -> visualize ?
// TODO: generally make methods more consistent

var constants = require('./main.constants');

var result = {
    
    consoleTime: [],
    console: [],
    
    /*
     * Displays the collected information on the screen.
     */
    
    print: function() {   
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (room.memory.base) {
                this.printRolesInfoForRoom(room);
                this.printConsole(room);
            }
        }
    },

    /*
     * Displays the role infos for a specific room on the screen.
     * 
     * @param {Room} room 
     */
    
    printRolesInfoForRoom: function(room) {   
        if (!room.memory.roleInfo)
            return;
        
        var x = room.memory.roleInfo.x || 0;
        var y = room.memory.roleInfo.y || 0;
        
        
        room.visual.text(room.memory.base.name, x, y++, {align: 'left', opacity: 0.8});
        
        var unusedRoles = '';
        
        for (const role in room.memory.roleInfo) {
            var count = room.memory.roleInfo[role];
            if (count.currentNumber || count.requiredNumber) {
            	var ofRequired = count.requiredNumber >= 0 ? '/' + count.requiredNumber : '';
                room.visual.text(count.symbol + ' ' + role + ' ' + count.currentNumber + ofRequired, x, y++, {align: 'left', opacity: 0.8});
            } else {
                unusedRoles += count.symbol;
            }
        }
        
        room.visual.text(unusedRoles + ' 0/0', x, y++, {align: 'left', opacity: 0.8});
    }, 

    /*
     * Displays the console for a specific room on the screen.
     * 
     * @param {Room} room 
     */
    
    printConsole: function(room) {   
        var x = room.memory.console && room.memory.console.x || 40;
        var xLine = x + 5;
        var yMin = room.memory.console && room.memory.console.y || 0;
        var height = this.getHeight(room);
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
    },

    /*
     * Returns the console height for a specific room.
     * 
     * @param {Room} room 
     */
    
    getHeight: function(room) {   
        return (room.memory.console && room.memory.console.height) || 5;
    },

    /*
     * Clears the UI console.
     */
    
    clearLog: function() {   
        this.consoleTime = [];
        this.console = [];
    },
    
    /*
     * Logs the string to the UI console.
     * 
     * @param the new line
     */
    
    log: function(newLine) {   
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
    },

    /*
     * Logs the error to the UI console.
     * 
     * @param the new line
     */
    
    error: function(newLine) {   
        this.log('🛑 ' + newLine);
    },

    /*
     * Returns the max console height for all rooms.
     * 
     * @param the new line
     */
    
    getMaxHeight: function() {   
        var result = 0;
        for (var roomName in Game.rooms) {
            var height = this.getHeight(Game.rooms[roomName])
            result = height > result ? height : height;
        }
        return result ? result : 10;
    },
};

module.exports = result;