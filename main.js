var info = require('main.info');

var baseManager = require('manager.base');

module.exports.loop = function () {

    // delete the memory of deceased creeps 

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    baseManager.runAll();
    info.print();
}