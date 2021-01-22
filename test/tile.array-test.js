var TileArray = require('../src/tile.array');
var assert = require('assert');

// All methods tested.

describe('tile.array', () => {
	it('constructor', () => {
		var startsWith = 'class TileArray';
		assert.equal(startsWith, TileArray.toString().substring(0, startsWith.length));
	});

	const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	
	describe('#toCompactString', () => {
		it('string array', () => {
			var abcArray = Array.from(abc);
			var array = new TileArray(6, 4);
			for (var x = 0; x < array._width; x++) {
				for (var y = 0; y < array._height; y++) {
					array.set(x, y, abcArray[x + y * array._width]);
				}
			}
			assert.equal('ABCDEFGHIJKLMNOPQRSTUVWX', array.toCompactString());
		});

		it('string array with padding', () => {
			var abcArray = Array.from(abc);
			var array = new TileArray(6, 4);
			for (var x = 0; x < array._width; x++) {
				for (var y = 0; y < array._height; y++) {
					array.set(x, y, abcArray[x + y * array._width]);
				}
			}
			array.set(0, 0, 'AA');
			
			assert.equal('AA B C D E F G H I J K L M N O P Q R S T U V W X', array.toCompactString());
		});

		it('string array with other padding', () => {
			var abcArray = Array.from(abc);
			var array = new TileArray(6, 4);
			for (var x = 0; x < array._width; x++) {
				for (var y = 0; y < array._height; y++) {
					array.set(x, y, abcArray[x + y * array._width]);
				}
			}
			array.set(0, 0, 'AA');
			
			assert.equal('AA~B~C~D~E~F~G~H~I~J~K~L~M~N~O~P~Q~R~S~T~U~V~W~X', array.toCompactString( { paddingChar: '~' } ));
		});

		it('int array', () => {
			var abcArray = Array.from(abc);
			var array = new TileArray(3, 4);
			for (var x = 0; x < array._width; x++) {
				for (var y = 0; y < array._height; y++) {
					if (x != y) {
						array.set(x, y, (x + y * array._width) % 10);
					}
				}
			}
			assert.equal(' 123 567 9 1', array.toCompactString());
		});
	});

	describe('#fromCompactStringAndSize', () => {
		it('string array', () => {
			var array = new TileArray(6, 4);
			array.fromCompactString('ABCDEFGHIJKLMNOPQRSTUVWX');

			var abcArray = Array.from(abc);
			for (var x = 0; x < array._width; x++) {
				for (var y = 0; y < array._height; y++) {
					assert.equal(abcArray[x + y * array._width], array.get(x, y));
				}
			}
		});

		it('string array with padding', () => {
			var array = new TileArray(6, 4);
			array.fromCompactString('AA B C D E F G H I J K L M N O P Q R S T U V W X');

			var abcArray = Array.from(abc);
			abcArray[0] = 'AA';
			for (var x = 0; x < array._width; x++) {
				for (var y = 0; y < array._height; y++) {
					assert.equal(abcArray[x + y * array._width], array.get(x, y));
				}
			}
		});

		it('string array with other padding', () => {
			var array = new TileArray(6, 4);
			array.fromCompactString('AA~B~C~D~E~F~G~H~I~J~K~L~M~N~O~P~Q~R~S~T~U~V~W~X', { paddingChar: '~' });

			var abcArray = Array.from(abc);
			abcArray[0] = 'AA';
			for (var x = 0; x < array._width; x++) {
				for (var y = 0; y < array._height; y++) {
					assert.equal(abcArray[x + y * array._width], array.get(x, y));
				}
			}
			var abcArray = Array.from(abc);
			var array = new TileArray(6, 4);
			for (var x = 0; x < array._width; x++) {
				for (var y = 0; y < array._height; y++) {
					array.set(x, y, abcArray[x + y * array._width]);
				}
			}
			array.set(0, 0, 'AA');
			
			assert.equal('AA~B~C~D~E~F~G~H~I~J~K~L~M~N~O~P~Q~R~S~T~U~V~W~X', array.toCompactString( { paddingChar: '~' } ));
		});

		it('empty values', () => {
			var array = new TileArray(6, 4);
			array.fromCompactString('');

			for (var x = 0; x < array._width; x++) {
				for (var y = 0; y < array._height; y++) {
					assert.equal('', array.get(x, y));
				}
			}
		});
	});
});