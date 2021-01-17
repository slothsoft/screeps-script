/*
 * This manager handles the watchtower and when and how they do what.
 * 
 * Watchtowers are 
 * - supposed to attack enemies any chance they get
 * - heal friendly creeps any chance they get
 * - TODO: heal other structures ...?
 */

var game = require('./main.game');
 
class TowerManager {

	/*
	 * Performs "runTowers()" on an instance of TowerManager for each room. 
	 * 
	 * @param allRoles
	 */
	
	static runAll() {
	    game.findAllRooms().forEach(room => new TowerManager(room).runTowers());
	}
	
	constructor(room) {
	    this.room = room;
	}
	
	runTowers() {
		
		// fetch all towers
		
		var allTowers = this.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_TOWER;
            }
		});
		
		// handle all towers
		
		allTowers.forEach(tower => {
			
			// 1st priority: kill attacking creeps
	        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
	        if (closestHostile) {
	            tower.attack(closestHostile);
	            return;
	        } 

			// 2nd priority: heal my creeps
	        
            var closestDamagedCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: (creep) => creep.hits < creep.hitsMax
            });
            if(closestDamagedCreep) {
                tower.repair(closestDamagedCreep);
                return;
            }
		});
	}

};

module.exports = TowerManager;