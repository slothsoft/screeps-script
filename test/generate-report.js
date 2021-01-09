require('@slothsoft/qunit-reporter').fromQUnit().toJUnit({
	file : 'result/export-junit.xml', // exports directly to file
	encoding : 'utf-8', // the encoding of the exported file
});