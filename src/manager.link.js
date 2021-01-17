/*
 * This manager handles the links and to send resources.
 */

var game = require('./main.game');
var info = require('./main.info');

var MemoryManager = require('./manager.memory');

const TYPE_TARGET = 'target';
const TYPE_SOURCE = 'source';

class LinkManager {
	 
	/*
	 * Performs "runLinks()" on an instance of LinkManager for each room. 
	 * 
	 * @param allRoles
	 */
	
	static runAll() {
	    game.findAllRooms().forEach(room => new LinkManager(room).runLinks());
	}

	static makeLinkTarget(linkId) {
		this.makeLinkType(linkId, TYPE_TARGET);
	}

	static makeLinkSource(linkId) {
		this.makeLinkType(linkId, TYPE_SOURCE);
	}

	static makeLinkType(linkId, type) {
		var object = Game.getObjectById(linkId);
		var memory = MemoryManager.fetchStructureMemory(object);
		memory.type = type; 
	}
	
	constructor(room) {
	    this.room = room;
	}
	
	runLinks() { 
		// TODO: implement transferId 
		
		// fetch all links
		
		var allSourceLinks = this.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
            	if (structure.structureType != STRUCTURE_LINK) {
            		return false;
            	}
        		var memory = MemoryManager.fetchStructureMemory(structure);
            	if (!memory.type) {
            		memory.type = TYPE_SOURCE;
            	}
                return memory.type == TYPE_SOURCE 
                	&& structure.store.getUsedCapacity(RESOURCE_ENERGY) >  0;
            }
		});

		// handle all links
		
		allSourceLinks.forEach(sourceLink => {

			// find possible target
			
			var targetLinks = this.room.find(FIND_MY_STRUCTURES, {
	            filter: (structure) => {
	            	if (structure.structureType != STRUCTURE_LINK) {
	            		return false;
	            	}
	                return MemoryManager.fetchStructureMemory(structure).type == TYPE_TARGET
	                	&& structure.store.getFreeCapacity(RESOURCE_ENERGY) >  0;
	            }
			}); // TODO: sort by capacity?
			
			if (targetLinks.length == 0) {
				info.log('Did not find targets');
				return;
			}

			// transfer my energy
			var targetLink = targetLinks[0];
			if (!sourceLink.cooldown) {
				sourceLink.transferEnergy(targetLink);  
				info.log('💫 transfering resources from ' + sourceLink.id + ' to ' + targetLinks[0].id);
			}
		});
	}

};

module.exports = LinkManager;