/** Simple "lack of model" -- just encode the bits directly.
 *  Useful especially with sparse spaces or Huffman coders where there's
 *  no obvious prediction to be made that will pay for itself.
 */
compressJS.NoModel = (function (module) {
	var Util = module.Util;

	var NoModel = function (bitstream, size) {
		this.bitstream = bitstream;
		this.bits = Util.fls(size - 1);
	};
	NoModel.factory = function (bitstream) {
		return function (size) {
			return new NoModel(bitstream, size);
		};
	};
	NoModel.prototype.encode = function (symbol) {
		var i;
		for (i = this.bits - 1; i >= 0; i--) {
			var b = (symbol >>> i) & 1;
			this.bitstream.writeBit(b);
		}
	};
	NoModel.prototype.decode = function () {
		var i, r = 0;
		for (i = this.bits - 1; i >= 0; i--) {
			r <<= 1;
			if (this.bitstream.readBit()) r++;
		}
		return r;
	};

	return NoModel;
})(compressJS);
