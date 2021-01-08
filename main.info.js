/*
 * This module is used to display some information to the screen, so debugging is easier.
 */
 
var constants = require('main.constants');

var result = {
    
    consoleTime: [],
    console: [],
    
    print: function() {   
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (room.memory.base) {
                this.printRolesInfoForRoom(room);
                this.printConsole(room);
            }
        }
    },
    
    printRolesInfoForRoom: function(room) {   
        var x = room.memory.base.roleInfoX || 0;
        var y = room.memory.base.roleInfoY || 0;
        
        if (!room.memory.base.roleInfo)
            return;
        
        room.visual.text(room.memory.base.name, x, y++, {align: 'left', opacity: 0.8});
        
        var unusedRoles = "";
        
        for (const role in room.memory.base.roleInfo) {
            var count = room.memory.base.roleInfo[role];
            if (count.currentNumber || count.requiredNumber) {
                room.visual.text(count.symbol + " " + role + " " + count.currentNumber + "/" + count.requiredNumber, x, y++, {align: 'left', opacity: 0.8});
            } else {
                unusedRoles += count.symbol;
            }
        }
        
        room.visual.text(unusedRoles + " 0/0", x, y++, {align: 'left', opacity: 0.8});
    },
    
    printConsole: function(room) {   
        var x = room.memory.base.consoleX;
        var xLine = x + 5;
        var yMin = room.memory.base.consoleY;
        var height = room.memory.base.consoleHeight || 5;
        var y = yMin + height;
        
        if (this.console.length == 0) {
            room.visual.text("<no console entries>", x, y, {align: 'left', opacity: 0.8});
        } else {
            for (const lineIndex in this.console) {
                var time = this.consoleTime[lineIndex];
                room.visual.text(time.toISOString().substring(2, 16).replace("T", " "), x, y, {align: 'left'});
                room.visual.text(this.console[lineIndex], xLine, y, {align: 'left'});
                
                y--;
                if (y <= yMin) {
                    break;
                }
            }
        }
    },
    
    log: function(newLine) {   
        if (newLine === 'object' && newLine !== null) {
            console.log(JSON.stringify(newLine));
        }
        
        this.consoleTime.splice(0, 0, new Date());
        this.console.splice(0, 0, newLine);
    },
};

module.exports = result;