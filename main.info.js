/*
 * This module is used to display some information to the screen, so debugging is easier.
 */

var result = {
    
    roles: { /* role => number of creeps */},

    print: function() {   
        for (var roomName in Game.rooms) {
            this.printRolesInfoForRoom(Game.rooms[roomName]);
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
};

module.exports = result;