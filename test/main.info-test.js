var classUnderTest = require('../src/main.info');
var assert = require('assert');

describe('main.info', () => {
	it('exists', () => {
		assert.equal(typeof classUnderTest === 'object' && classUnderTest !== null, true);
	});

	describe('#getHeight', () => {
		it('simple', () => {
			var room = { memory: { base: { consoleHeight: 7 } } };
			
			assert.equal(classUnderTest.getHeight(room), 7);
		});
	});
	
	describe('#getMaxHeight', () => {
		it('simple', () => {
			global.Game = { rooms : [ 'A', 'B', 'C' ] };
			var heights = [ 123, 456, 789 ];
			classUnderTest.getHeight = room => heights[Game.rooms.indexOf(room)]; 
			
			assert.equal(classUnderTest.getMaxHeight(), 789);
		});
	});

	describe('#log', () => {
		it('simple', () => {
			classUnderTest.clearLog();
			classUnderTest.log('A');
			classUnderTest.log('B');
			classUnderTest.log('C');

			assert.equal(classUnderTest.console.length, 3);
			assert.equal(classUnderTest.console[0].includes('C'), true);
			assert.equal(classUnderTest.console[1].includes('B'), true);
			assert.equal(classUnderTest.console[2].includes('A'), true);
		});

		it('reject over height', () => {
			classUnderTest.getMaxHeight = () => 2;
			
			classUnderTest.clearLog();
			classUnderTest.log('A');
			classUnderTest.log('B');
			classUnderTest.log('C');
			
			assert.equal(classUnderTest.console.length, 2);
			assert.equal(classUnderTest.console[0].includes('C'), true);
			assert.equal(classUnderTest.console[1].includes('B'), true);
		});
	});

	describe('#clearLog', () => {
		it('simple', () => {
			classUnderTest.log('A');
			classUnderTest.log('B');
			classUnderTest.log('C');

			classUnderTest.clearLog();

			assert.equal(classUnderTest.console.length, 0);
		});
	});
});
