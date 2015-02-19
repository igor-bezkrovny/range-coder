/* Range Coder.  Inspired by rangecod.c from rngcod13.zip from
 *    http://www.compressconsult.com/rangecoder/
 * This JavaScript version is:
 *    Copyright (c) 2013 C. Scott Ananian.
 */
compressJS.RangeCoderCompressor = (function (module) {
	var LENGTH_MODEL_CUTOFF = 256;
	var MATCH_LEN_CONTEXTS = 16;
	var MODEL_MAX_PROB = 0xFF00;
	var MODEL_INCREMENT = 0x100;

	var RangeCoder = module.RangeCoder,
		FenwickModel = module.FenwickModel,
		Context1Model = module.Context1Model,
		NoModel = module.NoModel,
		Util = module.Util;

	var RangeCoderCompressor = {};

	// stand alone compressor, mostly for testing
	RangeCoderCompressor.MAGIC = 'rang';
	RangeCoderCompressor.compressFile = Util.compressFileHelper(RangeCoderCompressor.MAGIC, function (input, output, size, props) {
		var huff = new RangeCoder(output);
		huff.encodeStart(0, 0);

		var coderFactory = new FenwickModel(huff, (size < 0) ? 257 : 256, MODEL_MAX_PROB, MODEL_INCREMENT);
		//var coderFactory = FenwickModel.factory(huff, MODEL_MAX_PROB, MODEL_INCREMENT);
		//var huffLiteral = new Context1Model(coderFactory, 256, (size < 0) ? 257 : 256);
		//Util.compressWithModel(input, size, huffLiteral);
		Util.compressWithModel(input, size, coderFactory);
		huff.encodeFinish();
	});

	// stand alone decompresser, again for testing
	RangeCoderCompressor.decompressFile = Util.decompressFileHelper(RangeCoderCompressor.MAGIC, function (input, output, size) {
		var huff = new RangeCoder(input);
		huff.decodeStart(true);

		var coderFactory, sparseCoderFactory, finish;

		var coderFactory = new FenwickModel(huff, (size < 0) ? 257 : 256, MODEL_MAX_PROB, MODEL_INCREMENT);
		//coderFactory = FenwickModel.factory(huff, MODEL_MAX_PROB, MODEL_INCREMENT);
		//var huffLiteral = new Context1Model(coderFactory, 256, (size < 0) ? 257 : 256);
		//Util.decompressWithModel(output, size, huffLiteral);
		Util.decompressWithModel(output, size, coderFactory);
		huff.decodeFinish();
	});

	return RangeCoderCompressor;
})(compressJS);
