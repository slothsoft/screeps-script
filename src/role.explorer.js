/*
 * An explorer goes straight to the next flag, conquers it and starts
 * a new base there.
 */
 
var constants = require('./main.constants');
var info = require('./main.info');
var game = require('./main.game');

var Builder = require('./role.builder');
var RolePrototype = require('./role.prototype');

// TODO document phases in readme
// TODO: remove flag and init base correctly
// TODO: also spawn name
const PHASE_GOTO_FLAG_ROOM = 'gotoFlagRoom';
const PHASE_CLAIM_FLAG_ROOM = 'claimFlagRoom';
const PHASE_CREATE_SPAWN = 'createSpawn';
const PHASE_BUILD_SPAWN = 'buildSpawn';

class Explorer extends RolePrototype {
	
	constructor() {
		super('Explorer', '#cccccc', '🏴');
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
	        return resultingCreep;
	    }
	    return resultingCreep;
	}

	work(creep) {
		if (!creep.memory.phase) {
			creep.memory.phase = PHASE_GOTO_FLAG_ROOM;
	    }
    
		// TODO: before that fill up and energy and renew
		
	    switch (creep.memory.phase) {
	        case PHASE_GOTO_FLAG_ROOM:
	            this.goToFlagRoom(creep);
	            break;
	        case PHASE_CLAIM_FLAG_ROOM:
	            this.claimFlagRoom(creep);
	            break;
	        case PHASE_CREATE_SPAWN:
	            this.createSpawn(creep);
	            break;
	        case PHASE_BUILD_SPAWN:
	            new Builder().work(creep);
	            break;
	        default:
	    	    info.log(game.getDisplayName(creep) + ' travels to ' + targetFlag.name);
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
    	    info.log(this.symbol + ' ' + game.getDisplayName(creep) + ' travels to ' + targetFlag.name);
      		creep.memory.home = targetFlag.name;
	    }
	    
	    // walk towards my flag
	    
	    this.moveToLocation(creep, targetFlag);
	    
	    if (creep.room == targetFlag.room) {
	    	var hasRoomAlready = creep.room.controller.my;
	        creep.memory.phase = hasRoomAlready ? PHASE_CREATE_SPAWN : PHASE_CLAIM_FLAG_ROOM;
	        info.log(this.symbol + ' ' + game.getDisplayName(creep) + ' claims the room of ' + targetFlag.name);
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
      		creep.memory.moving = true;
      	} else if (answer == OK) {
      		creep.memory.role = 'Builder';  
      		creep.memory.phase = PHASE_CREATE_SPAWN;
      	} else {
      		info.log(this.symbol + ' ' + game.getDisplayName(creep) + ' cannot claim: ' + answer);
      	}

	    if (creep.room.controller.my) {
	    	var hasSpawnAlready = creep.room.find(FIND_SOURCES).length > 0;
	        creep.memory.phase = hasSpawnAlready ? PHASE_BUILD_SPAWN : PHASE_CREATE_SPAWN;
	        info.log(this.symbol + ' ' + game.getDisplayName(creep) + ' builds a spawn on ' + targetFlag.name);
	    }
	}
	
	createSpawn(creep) {
    	var hasSpawnAlready = creep.room.find(FIND_SOURCES).length > 0;
    	if (hasSpawnAlready) {
	        creep.memory.phase = PHASE_BUILD_SPAWN;
	        return;
    	}
    	
        var targetFlag = this.findTargets(creep.room).filter(target => target.name == creep.memory.targetFlag)[0];
        if (targetFlag.pos.createConstructionSite(STRUCTURE_SPAWN) == OK) {
	        info.log(this.symbol + ' ' + game.getDisplayName(creep) + ' is a Builder now.');
	        creep.memory.phase = PHASE_BUILD_SPAWN;
        }
	}
}

module.exports = Explorer;