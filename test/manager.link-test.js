var LinkManager = require('../src/manager.link');
var assert = require('assert');

var constants = require('../src/main.constants');
var info = require('../src/main.info');

var Room = require('./mock/room-mock');
var Store = require('./mock/store-mock');

// All methods tested.

describe('manager.link', () => {
	it('exists', () => {
		var startsWith = 'class LinkManager';
		assert.equal(startsWith, LinkManager.toString().substring(0, startsWith.length));
	});

	describe('#makeLinkTarget', () => {
		it('no type present', () => {
			var structure = structure = {
				id: 'ID',
			};
			Game.getObjectById = id => structure;
			
			LinkManager.makeLinkTarget('ID');
			
			assert.equal(constants.LINK_TYPE_TARGET, structure.memory.type);
			assert.equal(constants.LINK_TYPE_TARGET, Memory.structures.ID.type);
		});

		it('type already present', () => {
			var structure = structure = {
				id: 'ID',
				memory: {
					type: constants.LINK_TYPE_SOURCE,
				},
			};
			Game.getObjectById = id => structure;
			
			LinkManager.makeLinkTarget('ID');
			
			assert.equal(constants.LINK_TYPE_TARGET, structure.memory.type);
			assert.equal(constants.LINK_TYPE_TARGET, Memory.structures.ID.type);
		});
	});

	describe('#makeLinkSource', () => {
		it('no type present', () => {
			var structure = structure = {
				id: 'ID',
			};
			Game.getObjectById = id => structure;
			
			LinkManager.makeLinkSource('ID');
			
			assert.equal(constants.LINK_TYPE_SOURCE, structure.memory.type);
			assert.equal(constants.LINK_TYPE_SOURCE, Memory.structures.ID.type);
		});

		it('type already present', () => {
			var structure = structure = {
				id: 'ID',
				memory: {
					type: constants.LINK_TYPE_TARGET,
				},
			};
			Game.getObjectById = id => structure;
			
			LinkManager.makeLinkSource('ID');
			
			assert.equal(constants.LINK_TYPE_SOURCE, structure.memory.type);
			assert.equal(constants.LINK_TYPE_SOURCE, Memory.structures.ID.type);
		});
	});

	describe('#makeLinkType', () => {
		it('no type present', () => {
			var structure = structure = {
				id: 'ID',
			};
			Game.getObjectById = id => structure;
			
			LinkManager._makeLinkType('ID', 'other');
			
			assert.equal('other', structure.memory.type);
			assert.equal('other', Memory.structures.ID.type);
		});

		it('type already present', () => {
			var structure = structure = {
				id: 'ID',
				memory: {
					type: 'blob',
				},
			};
			Game.getObjectById = id => structure;
			
			LinkManager._makeLinkType('ID', 'other');
			
			assert.equal('other', structure.memory.type);
			assert.equal('other', Memory.structures.ID.type);
		});
	});
	
	describe('#findSourceLinks', () => {
		it('accept correct structures', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				
				var filter = opt.filter;
				
				var structure = {};
				structure.store = new Store(100);
				structure.store.usedCapacity = 100;
				
				// 'no type' means it's a source
				structure.structureType = STRUCTURE_LINK; 
				assert.equal(true, filter(structure));

				structure.structureType = STRUCTURE_LINK;
				structure.memory.type = 'source';
				assert.equal(true, filter(structure));
			};
	
			var manager = new LinkManager(room);
			manager._findSourceLinks();
			
			assert.equal(true, findWasCalled);
		});

		it('reject incorrect structures', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				
				var filter = opt.filter;
				
				var structure = {};
				structure.id = 'ID';
				structure.store = new Store(100);
				structure.store.usedCapacity = 100;
				
				structure.structureType = STRUCTURE_SPAWN; 
				assert.equal(false, filter(structure));

				structure.structureType = STRUCTURE_LINK;
				assert.equal(false, filter(structure));

				structure.memory.type = 'source';
				assert.equal(true, filter(structure));

				structure.store.usedCapacity = 0;
				assert.equal(false, filter(structure));
			};
	
			var manager = new LinkManager(room);
			manager._findSourceLinks();
			
			assert.equal(true, findWasCalled);
		});
	});

	describe('#findTargetLink', () => {
		it('accept correct structures', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				
				var filter = opt.filter;
				
				var structure = {};
				structure.id = 'ID';
				structure.structureType = STRUCTURE_LINK;
				structure.store = new Store(100);
				Memory.structures.ID.type = 'target';

				assert.equal(true, filter(structure));
				return [ structure ];
			};

			var sourceLink = {};
	
			var manager = new LinkManager(room);
			manager._findTargetLink(sourceLink);
			
			assert.equal(true, findWasCalled);
		});

		it('reject incorrect structures', () => {
			
			var room = new Room();
			var findWasCalled = false;
			room.find = (type, opt) => {
				findWasCalled = true;
				
				var filter = opt.filter;
				
				var structure = {};
				structure.id = 'ID';
				structure.structureType = STRUCTURE_LINK;
				structure.store = new Store(100);
				Memory.structures.ID.type = 'target';

				assert.equal(true, filter(structure));

				Memory.structures.ID.type = 'source';
				assert.equal(false, filter(structure));
				
				Memory.structures.ID.type = 'target';
				structure.store.usedCapacity = 100;
				assert.equal(false, filter(structure));

				structure.store.usedCapacity = 0;
				structure.structureType = STRUCTURE_SPAWN;
				assert.equal(false, filter(structure));
				
				return [];
			};

			var sourceLink = {};
			
			var manager = new LinkManager(room);
			manager._findTargetLink(sourceLink);
			
			assert.equal(true, findWasCalled);
		});
	});

	describe('#runLink', () => {
		beforeEach(() => {
			info.clearLines();
		});
		
		it('default', () => {

			var room = new Room();

			var sourceLink = { id: 'SOURCE' };
			
			var targetLink = { id: 'TARGET' };

			var transferEnergyCalled = false;
			sourceLink.transferEnergy = (t) => {
				transferEnergyCalled = true;

				assert.deepEqual(targetLink, t);
			};
			
			var manager = new LinkManager(room);
			manager._findTargetLink = source => targetLink;
			manager._runLink(sourceLink);
			
			assert.equal(true, transferEnergyCalled);
			assert.equal(1, info.getLines().length);
			assert.equal('💫 transfering resources from SOURCE to TARGET', info.getLine(0));
		});

		it('with cooldown', () => {

			var room = new Room();

			var sourceLink = { id: 'SOURCE' };
			sourceLink.cooldown = 10;
			
			var targetLink = { id: 'TARGET' };

			var transferEnergyCalled = false;
			sourceLink.transferEnergy = (t) => {
				transferEnergyCalled = true;
			};
			
			var manager = new LinkManager(room);
			manager._findTargetLink = source => targetLink;
			manager._runLink(sourceLink);
			
			assert.equal(false, transferEnergyCalled);
			assert.equal(0, info.getLines().length);
		});

		it('no target', () => {

			var room = new Room();

			var sourceLink = { id: 'SOURCE' };
			
			var transferEnergyCalled = false;
			sourceLink.transferEnergy = (t) => {
				transferEnergyCalled = true;
			};
			
			var manager = new LinkManager(room);
			manager._findTargetLink = source => null;
			manager._runLink(sourceLink);
			
			assert.equal(false, transferEnergyCalled);
			assert.equal(0, info.getLines().length);
		});
	});

	describe('#runLinks', () => {
		beforeEach(() => {
			info.clearLines();
		});
		
		it('default', () => {

			var room = new Room();

			var sourceLink1 = { id: 'SOURCE1' };

			var sourceLink2 = { id: 'SOURCE2' };
			sourceLink2.cooldown = 10;

			var sourceLink3 = { id: 'SOURCE3' };
			
			var targetLink = { id: 'TARGET' };

			var transferEnergyCalled = false;
			sourceLink1.transferEnergy = (t) => {
				transferEnergyCalled = true;

				assert.deepEqual(targetLink, t);
			};
			sourceLink2.transferEnergy = (t) => assert.fail('SOURCE2 should not transfer ennergy!');
			sourceLink3.transferEnergy = (t) => assert.fail('SOURCE3 should not transfer ennergy!');
			
			var manager = new LinkManager(room);
			manager._findSourceLinks = () => [ sourceLink1, sourceLink2, sourceLink3 ];
			manager._findTargetLink = source => sourceLink1 == source ? targetLink : null;
			manager.runLinks();
			
			assert.equal(true, transferEnergyCalled);
			assert.equal(1, info.getLines().length);
			assert.equal('💫 transfering resources from SOURCE1 to TARGET', info.getLine(0));
		});
	});
});
