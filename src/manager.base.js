/*
 * A base is a 'virtual' construct. It most closely resembles a 'room'.
 * To configure a base, the first spawn is marked as such. To create more 
 * then one base, all further have to be marked manually?
 */
 
var game = require('./main.game');
var constants = require('./main.constants');
var info = require('./main.info');

var Harvester = require('./role.harvester');
var Builder = require('./role.builder');
var Upgrader = require('./role.upgrader');
var Handman = require('./role.handyman');
var Explorer = require('./role.explorer');
var Miner = require('./role.miner');
var StoreKeeper = require('./role.storekeeper');

class BaseManager {
    
	constructor(room) {
	    this.room = room;
	    this.defaultRole = new Harvester();
	    this.allRoles = [
	    	new Harvester(), 
	    	new Builder(), 
	    	new Upgrader(), 
	    	new Handman(), 
//	    	new Explorer(), 
	    	new Miner(),
	    	new StoreKeeper(),
	    ].sort((a, b) => b.priority - a.priority);
	}

	/*
	 * Runs this manager for the specific room it belongs too.
	 */	
    
    runBase() {  
        this.initRoleInfo();

    	if (this.room.memory.base) {
	        this.repopulateCreeps();
	        this.showSpawningAnimation();
	        this.moveCreeps();
    	}
    }

    
    /* 
     * Test for each role if enough creeps are present (else create them).
     */

    repopulateCreeps() {    
    	var baseName = this.room.memory.base.name;
        this.allRoles.forEach(role => {
            var foundCreeps = game.findAllCreeps().filter(creep => creep.memory.role == role.roleName && creep.memory.home == baseName);
            
            if (foundCreeps.length < this.room.memory.base.roleInfo[role.roleName].requiredNumber) {
                this.spawnCreepForRole(role);
            }
        });
    }
       
    /* 
     * Spawns a creep in a room for a specific role.
     * 
	 * @param role
     */

    spawnCreepForRole(role) {    
        var freeSpawn = this.fetchFreeSpawn(this.room);
        if (freeSpawn) {
            var resultingCreep = role.spawnCreep(freeSpawn);
            if (resultingCreep) {
                info.log(role.symbol + ' Spawning new ' + role.roleName + ' (' + resultingCreep.body.length + 'p)');
            }
            return resultingCreep;
        } 
        return null;
    }

    /* 
     * Fetches a free spawn for this particular room.
     */
    
    fetchFreeSpawn() {  
    	var baseName = this.room.memory.base.name;
        var freeSpawns = game.findAllSpawns().filter(spawn => spawn.memory.home == baseName && !spawn.spawning);
        return freeSpawns.length > 0 ? freeSpawns[0] : null;
    }  
        
    /*
     * Show spawning 'animation' for each spawn.
     */
    
    showSpawningAnimation() {  
    	game.findAllSpawns().filter(spawn => spawn.spawning && spawn.room == this.room).forEach(spawn => {
            spawn.room.visual.text('🔁', spawn.pos.x - 1, spawn.pos.y, {align: 'left', opacity: 0.8});
        });
    }
    
    /*
     * Move the creeps around for a specific room.
     */
    
    moveCreeps() {  
    	var baseName = this.room.memory.base.name;
        game.findAllCreeps()
	        	.filter(creep => creep.memory.home == baseName) // creeps of this base
	        	.filter(creep => !creep.spawning) // that are not spawning
	        	.forEach(creep => {
            try {
                var creepRole = this.findNecessaryMandatoryRole(creep.memory.role);
                creepRole.run(creep);

                // TODO: the creep's room is not okay, still... is this ok?
                if (!creep.room.memory.base) creep.room.memory.base = {};
                if (!creep.room.memory.base.roleInfo) creep.room.memory.base.roleInfo = {};
                if (!creep.room.memory.base.roleInfo[creepRole.roleName]) creep.room.memory.base.roleInfo[creepRole.roleName] = {};
                // the creep counts for the room it is currently in, not the base's room
                var currentNumber = creep.room.memory.base.roleInfo[creepRole.roleName].currentNumber;
                creep.room.memory.base.roleInfo[creepRole.roleName].currentNumber = currentNumber ? currentNumber + 1 : 1;
                
                if (constants.DEBUG_ROLES) {
                	this.room.visual.text(creepRole.symbol, creep.pos.x, creep.pos.y, {align: 'left', opacity: 0.8});
                }
            } catch (e) {
                console.log(e.stack);
                info.log(e);
            }
        });
    }

    /*
     * Find a role. Never returns null. The resulting roll is always necessary.
     */
    
    findNecessaryMandatoryRole(roleName) {
        var result = this.findMandatoryRole(roleName);
        
        if (!result.isNecessary(this.room)) {
            // we have creeps in a role that is not necessary - try to find something better to do
            var necessaryRoles = this.allRoles.filter(role => {
            	return (this.room.memory.base.roleInfo[role.roleName].requiredNumber > 0) && role.isNecessary(this.room)
            });
            if (necessaryRoles.length > 0) {
            	result = necessaryRoles[0];
            }
        }
        return result;
    }
    
    /*
     * Find a role. Never returns null, but the default role. Logs an error if role could not be found.
     */
    
    findMandatoryRole(roleName) {
        var creepRoles = this.allRoles.filter(role => roleName == role.roleName);
        
        if(creepRoles.length > 0) {
            return creepRoles[0];
        } 
        // if no role could be found for a creep... he uses the default role
        info.error('COULD NOT FIND ROLE: ' + roleName + ' 🛑');
        return this.defaultRole;
    }
    
    /*
     * Init role info on room, so we can print it (or do whatever).
     */

    initRoleInfo() { 
        var currentRoleInfo = { }; 
        
        this.allRoles.forEach(role => {
        	var hasBase = this.room.memory.base;
            var originalRoleInfo = this.room.memory.base && this.room.memory.base.roleInfo && this.room.memory.base.roleInfo[role.roleName];
            currentRoleInfo[role.roleName] = {
                symbol: role.symbol,
                requiredNumber: hasBase ? (originalRoleInfo && originalRoleInfo.requiredNumber) || role.requiredNumber : -1,
                currentNumber: 0,
            };
        });
        if (!this.room.memory.base) 
        	this.room.memory.base = {};
        this.room.memory.base.roleInfo = currentRoleInfo;
    }

};

/*
 * Initializes the very first base.
 */	

BaseManager.init = () => {  

    var allSpawns = game.findAllSpawns();
    var initialSpawn = allSpawns.length > 0 ? allSpawns[0] : null;
    
    if (!initialSpawn) {
        return; // nothing has happened yet
    }
    
    if (allSpawns.length > 0 && allSpawns.filter(spawn => spawn.memory.home).length == 0) {
        // Congratz! We just spawned our very first base!
    	BaseManager.initSpawn(initialSpawn, 'Dresden'); //
    }
    
    // all spawns (and all creeps) have a home, so that we find them again
    
    allSpawns.filter(spawn => !spawn.memory.home).forEach(spawn => {
        spawn.memory.home = initialSpawn.room.memory.base.name;
        info.log('🏠 Created new spawn in base: ' + spawn.room.memory.home);
    });
};


/*
 * Initializes the spawn as a base.
 * 
 * @param {Spawn} spawn
 * @param baseName
 */	

BaseManager.initSpawn = (spawn, baseName) => {  
    spawn.room.memory.base = {
         name : baseName,
         roleInfoX: 0,
         roleInfoY: 0,
         consoleX: 38,
         consoleY: 44,
         consoleHeight: 5,
    };
    info.log('🏠 Created new base: ' + spawn.room.memory.base.name);
};

module.exports = BaseManager;