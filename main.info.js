/*
 * This module is used to display some information to the screen, so debugging is easier.
 */
 
var constants = require('main.constants');

var result = {
    
    console: [],
    
    print: function() {   
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            this.printRolesInfoForRoom(room);
            this.printConsole(room);
        }
    },
    
    printRolesInfoForRoom: function(room) {   
        var x = room.memory.base.roleInfoX || 0;
        var y = room.memory.base.roleInfoY || 0;
        
        if (!room.memory.base.roleInfo)
            return;
        
        room.visual.text(room.memory.base.name, x, y++, {align: 'left', opacity: 0.8});
        
        for (const role in room.memory.base.roleInfo) {
            var count = room.memory.base.roleInfo[role];
            room.visual.text(count.symbol + " " + role + " " + count.currentNumber + "/" + count.requiredNumber, x, y++, {align: 'left', opacity: 0.8});
        }
    },
    
    printConsole: function(room) {   
        var x = room.memory.base.consoleX;
        var yMin = room.memory.base.consoleY;
        var height = room.memory.base.consoleHeight || 5;
        var y = yMin + height;
        
        if (this.console.length == 0) {
            room.visual.text("<no console entries>", x, y, {align: 'left', opacity: 0.8});
        } else {
                
            for (const lineIndex in this.console) {
                room.visual.text(this.console[lineIndex], x, y--, {align: 'left'});
                
                if (y <= yMin) {
                    break;
                }
            }
        }
    },
    
    log: function(newLine) {   
        this.console.splice(0, 0, newLine);
    },
};

module.exports = result;