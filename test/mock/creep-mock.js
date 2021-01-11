/*
 * API for Creeps: https://docs.screeps.com/api/#Creep
 */

require('./game-mock');

global.MOVE = 'move';
global.WORK = 'work';
global.CARRY = 'carry';
global.ATTACK = 'attack';
global.RANGED_ATTACK = 'ranged_attack';
global.TOUGH = 'tough';
global.HEAL = 'heal';
global.CLAIM = 'claim';

global.BODYPART_COST = {
	'move': 50,
	'work': 100,
	'carry': 80,
	'attack': 50,
	'heal': 250,
	'ranged_attack': 150,
	'tough': 10,
	'claim': 600
};

class Creep {

	constructor(name, memory = {}) {
		this.id = name ? name : 'Creep' + Game.creeps.length;
	    Game.creeps[this.id] = this;
		
	    this.memory = Memory.creeps[this.id] = memory;
	}
}

module.exports = Creep;
