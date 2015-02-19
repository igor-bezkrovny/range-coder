/** A simple context-1 model. */
compressJS.Context1Model = (function (module) {
	var Context1Model = function (modelFactory, contextSize, alphabetSize) {
		var i;
		this.literalModel = [];
		// even if there's an EOF symbol, we don't need a context for it!
		for (i = 0; i < contextSize; i++) {
			this.literalModel[i] = modelFactory(alphabetSize);
		}
	};
	Context1Model.prototype.encode = function (ch, context) {
		this.literalModel[context].encode(ch);
	};
	Context1Model.prototype.decode = function (context) {
		return this.literalModel[context].decode();
	};

	/** Simple self-test. */
	Context1Model.MAGIC = 'ctx1';
	return Context1Model;
})(compressJS);
