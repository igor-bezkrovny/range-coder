var assert = require("assert");
var lzp3 = require('./lib/Lzp3');
var fs = require('fs');

var testRoundTrip = function (cmp, level, filename) {
	var referenceData = fs.readFileSync('./' + filename + '.ref');
	var data = cmp.compressFile(referenceData, null, level);
	// convert to buffer
	data = new Buffer(data);
	// round trip
	var data2 = cmp.decompressFile(data);
	// convert to buffer
	data2 = new Buffer(data2);
	
	if(referenceData.toString('hex') ===  data2.toString('hex')) {
		console.log("good");
	} else {
		console.log("bad");
	}
};

// test round-trip encode/decode for all compression variants
testRoundTrip(lzp3, null, 'sample5');
