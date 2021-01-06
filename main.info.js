/*
 * This module is used to display some information to the screen, so debugging is easier.
 */

var result = {
    
    roles: { /* role => number of creeps */},

    print: function(room) {   
        //room.controller.memory.infoX = 7;
        var y = 0;
        for (const [role, count] of this.roles) {
          console.log(role.roleName, count)
          room.visual.text(role.symbol + " " + role.roleName + " " + count + "/" + role.requiredNumber, 0, y, {align: 'left', opacity: 0.8});
          y++;
        }
    },
};

module.exports = result;