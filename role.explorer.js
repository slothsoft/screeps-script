/*
 * An explorer goes straight to the next flag, conquers it and starts
 * a new base there.
 */
 
var info = require('main.info');

var RolePrototype = require('role.prototype');
 
var result = Object.create(RolePrototype);
result.roleName = 'Explorer';
result.requiredNumber = 0;
result.color = '#cccccc';
result.symbol = '🏴';

result.findTargets = function(room) {
    var result = [];
    for (var flagName in Game.flags) {
        result.push(Game.flags[flagName]);
    }
    return result;
};

const PHASE_GOTO_FLAG_ROOM = "gotoFlagRoom";
const PHASE_CLAIM_FLAG_ROOM = "claimFlagRoom";

result.work = function(creep) {
    if (!creep.memory.phase) {
    }
        creep.memory.phase = PHASE_GOTO_FLAG_ROOM;
    
    switch (creep.memory.phase) {
        case PHASE_GOTO_FLAG_ROOM:
            this.goToFlagRoom(creep);
            break;
        default:
            goToFlagRoom(creep);
            break;
    }
};

/*
 * Find the correct Flag to go to
 **/
 
result.goToFlagRoom = function(creep) {
    var targetFlag;
    if (creep.memory.target) {
        var creepTarget = _.filter(result.findTargets(creep.room), (target) => target.name == creep.memory.target);
        if (creepTarget.length > 0) {
            targetFlag = creepTarget[0];
        }
    }
    if (!targetFlag) {
        targetFlag = result.findClosestTarget(creep);
        creep.memory.target = targetFlag.name;
        info.log(result.roleName + " travels to " + targetFlag.name);
        console.log("asd");
    }
    
    // walk towards my flag
    
    this.moveToLocation(creep, targetFlag);
    
    if (creep.room == targetFlag.room) {
        creep.memory.phase = PHASE_CLAIM_FLAG_ROOM;
        info.log(result.roleName + " claims the room of " + targetFlag.name);
        console.log("Tas");
    }
}

module.exports = result;