///<reference path="./subbotin.ts"/>
module RANGECODER {

	var WSIZ : number = 1 << 11,
		STEP : number = 8;

	interface STATISTICS {
		symbol : number;
		freq : number;
	}

	export class ORDER_0_CODER {
		private _cumulativeFrequency : number;
		private _escFrequency : number;
		private _symbolsNumber : number;
		private _rc : RangeCoder;
		private _alphabetSize : number;
		private _alphabet : number[];

		private _statistics : STATISTICS[];

		constructor(rc : RangeCoder, alphabet? : any) {
			var i : number;

			this._rc = rc;
			this._cumulativeFrequency = this._escFrequency = 1;
			this._symbolsNumber = 0;

			if (typeof alphabet === "undefined") {
				this._alphabet = [];
				for (i = 0; i < 256; i++) this._alphabet[ i ] = i;
			} else if (typeof alphabet === "number") {
				this._alphabet = [];
				for (i = 0; i < alphabet; i++) this._alphabet[ i ] = i;
			} else if (Object.prototype.toString.call(alphabet) === "[object Array]") {
				this._alphabet = alphabet;
			} else if (typeof alphabet === "string") {
				this._alphabet = alphabet.split("").map(function (ch) {
					return ch.charCodeAt(0);
				});
			}
			this._alphabetSize = this._alphabet.length;

			this._statistics = new Array(this._alphabetSize + 1);
			for (i = 0; i < this._alphabetSize + 1; i++) {
				this._statistics[ i ] = {
					symbol: i,
					freq  : 0
				};
			}
		}

		private sortSymbolsRare() {
			var index = 1,
				p;

			while ((p = this._statistics[ index ]).freq !== 0) {
				if (this._statistics[ index ].freq > this._statistics[ index - 1 ].freq) {
					var index1 = index,
						tmp = this._statistics[ index1 ];

					do {
						this._statistics[ index1 ] = this._statistics[ index1 - 1 ];
						index1--;
					} while (index1 > 0 && tmp.freq > this._statistics[ index1 - 1 ].freq);
					this._statistics[ index1 ] = tmp;
				}

				index++;
			}
		}

		private rescaleRare() {
			this.sortSymbolsRare();
			this._cumulativeFrequency = 0;

			var index = 0,
				p;

			while ((p = this._statistics[ index ]).freq !== 0) {
				if ((p.freq >>= 1) !== 0) {
					this._cumulativeFrequency += p.freq;
				} else {
					this._escFrequency++;
					this._symbolsNumber--;
				}

				index++;
			}
			this._escFrequency -= this._escFrequency >> 1;
			this._cumulativeFrequency += this._escFrequency;
		}

		public encodeSymbol(sym : number) : void {
			var symInAlphabet : number = this._alphabet.indexOf(sym);
			if (symInAlphabet < 0) {
				throw new Error("[encodesymbol] symbol " + sym + " is not in alphabet");
			}

			if (this._cumulativeFrequency > WSIZ) {
				this.rescaleRare();
			}

			var LoCount : number = 0,
				index = 0;

			for (; this._statistics[ index ].symbol !== symInAlphabet; index++) {
				LoCount += this._statistics[ index ].freq;
			}

			var p = this._statistics[ index ];
			if (!p.freq) {
				this._rc.Encode(LoCount, this._escFrequency, this._cumulativeFrequency);
				this._rc.Encode(index - this._symbolsNumber, 1, this._alphabetSize + 1 - this._symbolsNumber);
				p.freq = (STEP / 2) | 0;
				this._escFrequency += (STEP / 2) | 0;
				this._cumulativeFrequency += STEP;
				this._statistics[ index ] = this._statistics[ this._symbolsNumber ];
				this._statistics[ this._symbolsNumber ] = p;
				this._symbolsNumber++;
				this.sortSymbolsRare();
			} else {
				this._rc.Encode(LoCount, p.freq, this._cumulativeFrequency);
				p.freq += STEP;
				this._cumulativeFrequency += STEP;
			}
		}

		public decodeSymbol() : number {
			if (this._cumulativeFrequency > WSIZ) {
				this.rescaleRare();
			}

			var count : number = this._rc.GetFreq(this._cumulativeFrequency),
				index,
				p,
				result;

			if (count >= this._cumulativeFrequency - this._escFrequency) {
				this._rc.Decode(this._cumulativeFrequency - this._escFrequency, this._escFrequency, this._cumulativeFrequency);

				index = this._symbolsNumber + this._rc.GetFreq(this._alphabetSize + 1 - this._symbolsNumber);
				p = this._statistics[ index ];

				var sym : number = p.symbol;
				this._rc.Decode(index - this._symbolsNumber, 1, this._alphabetSize + 1 - this._symbolsNumber);
				p.freq = (STEP / 2) | 0;
				this._escFrequency += (STEP / 2) | 0;
				this._cumulativeFrequency += STEP;
				this._statistics[ index ] = this._statistics[ this._symbolsNumber ];
				this._statistics[ this._symbolsNumber ] = p;
				this._symbolsNumber++;

				this.sortSymbolsRare();
				result = sym;
			} else {
				var HiCount : number = 0;

				index = 0;
				while ((HiCount += this._statistics[ index ].freq) <= count) index++;

				p = this._statistics[ index ];
				this._rc.Decode(HiCount - p.freq, p.freq, this._cumulativeFrequency);
				p.freq += STEP;
				this._cumulativeFrequency += STEP;
				result = p.symbol;
			}

			if (result < 0 || result >= this._alphabetSize) {
				throw new Error("[decodesymbol] symbol index " + result + " is out of alphabet size");
			}
			return this._alphabet[ result ];
		}

	}
}
