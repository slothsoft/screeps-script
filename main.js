var info = require('main.info');

var roleManager = require('manager.role');
var baseManager = require('manager.base');

module.exports.loop = function () {

    // console.log("Energy: " + Game.spawns['Spawn1'].room.energyAvailable);

    // delete the memory of deceased creeps 

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    baseManager.init();
    roleManager.repopulateCreeps();

    
    // show spawning "animation"

    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }
    
    
    roleManager.moveCreeps();
    info.print();
}