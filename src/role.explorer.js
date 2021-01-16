/*
 * An explorer goes straight to the next flag, conquers it and starts
 * a new base there.
 */
 
var constants = require('./main.constants');
var info = require('./main.info');
var game = require('./main.game');

var RolePrototype = require('./role.prototype');

const PHASE_GOTO_FLAG_ROOM = 'gotoFlagRoom';
const PHASE_CLAIM_FLAG_ROOM = 'claimFlagRoom';

class Explorer extends RolePrototype {

	constructor() {
		super('Explorer', 0, '#cccccc', '🏴');
	}

	findTargets(room) {
	    return game.findAllFlags();
	}

	/*
	 * This method is called by the framework, so we need to find an open
	 * flag for the creep to attach to.
	 */
	
	spawnCreep(spawn) {
		var claimedFlags = game.findAllCreeps().filter(creep => creep.memory.targetFlag).map(creep => creep.memory.targetFlag);
		var allFlags = game.findAllFlags().filter(flag => !claimedFlags.includes(flag.name));
		if (allFlags.length > 0)
			return this.spawnCreepFromSpawn(spawn, allFlags[0].name);
		return false;
	}

	spawnCreepFromSpawnName(spawnName, flagName) {
	    var spawns = game.findAllSpawns().filter(spawn => spawn.name == spawnName);
	    if (spawns.length == 0) {
	        info.error('Could not find spawn: ' + spawnName);
	        return false;
	    }
	    var spawn = spawns[0];
	    var resultingCreep = this.spawnCreepFromSpawn(spawn, flagName);
	    if (resultingCreep) {
	        info.log(this.symbol + ' Spawning new ' + this.roleName + ' (' + resultingCreep.body.length + 'p)');
	        return resultingCreep;
	    }
	    return resultingCreep;
	}

	spawnCreepFromSpawn(spawn, flagName) {
	    var resultingCreep = this.spawnCreepWithParts(spawn, [WORK, MOVE, CARRY, MOVE], [ CLAIM, MOVE ]);
	    if (resultingCreep) {
	        resultingCreep.memory.targetFlag = flagName;
	        resultingCreep.memory.home = flagName;
	        return resultingCreep;
	    }
	    return resultingCreep;
	}

	work(creep) {
		if (!creep.memory.phase) {
			creep.memory.phase = PHASE_GOTO_FLAG_ROOM;
	    }
    
	    switch (creep.memory.phase) {
	        case PHASE_GOTO_FLAG_ROOM:
	            this.goToFlagRoom(creep);
	            break;
	        case PHASE_CLAIM_FLAG_ROOM:
	            this.claimFlagRoom(creep);
	            break;
	        default:
	    	    info.log(this.roleName + ' travels to ' + targetFlag.name);
	            break;
	    }
	}
	
	/*
	 * Find the correct flag to go to
	 */
	 
	goToFlagRoom(creep) {
	    var targetFlag;
	    if (creep.memory.targetFlag) {
	        var creepTarget = this.findTargets(creep.room).filter(target => target.name == creep.memory.targetFlag);
	        if (creepTarget.length > 0) {
	            targetFlag = creepTarget[0];
	        }
	    }
	    if (!targetFlag) {
	        targetFlag = this.findClosestTarget(creep);
	        creep.memory.targetFlag = targetFlag.name;
    	    info.log(this.symbol + ' ' + this.roleName + ' travels to ' + targetFlag.name);
      		creep.memory.home = targetFlag.name;
	    }
	    
	    // walk towards my flag
	    
	    this.moveToLocation(creep, targetFlag);
	    
	    if (creep.room == targetFlag.room) {
	        creep.memory.phase = PHASE_CLAIM_FLAG_ROOM;
	        info.log(this.symbol + ' ' + this.roleName + ' claims the room of ' + targetFlag.name);
	    }
	}

	/*
	 * Claim the flag's room
	 */
	 
	claimFlagRoom(creep) {
        var targetFlag = this.findTargets(creep.room).filter(target => target.name == creep.memory.targetFlag)[0];
      	var answer = creep.claimController(targetFlag.room.controller);
      	if (answer == ERR_NOT_IN_RANGE) {
      		creep.moveTo(targetFlag.room.controller);
      	} else if (answer == OK) {
      		creep.memory.role = 'Builder';  
      	} else if (answer == ERR_GCL_NOT_ENOUGH) { 
      		creep.memory.role = 'Builder'; // TODO: this is not correct or is it? just use controller.my to prevent
      	} else (info.log(this.symbol + ' ' + this.roleName + ' cannot claim: ' + answer));
      	// if claimed... create spawn (if possible) on flag
      	// construct spawn (need 15K energy, so others build it) (2 builders at least needed)
      	// spawn and room should have new base's name
	}
}

module.exports = Explorer;