///<reference path="./subbotin.ts"/>
module RANGECODER {

	var RADIX_64_BASE = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/_';
	var alphabet = RADIX_64_BASE.length;

	var WSIZ : number = 1 << 11,
		STEP : number = 8;

	interface STATISTICS {
		Symbol : number; // uint
		Freq : number; // uint
	}

	export class ORDER_0_CODER {
		private SummFreq : number; // uint
		private EscFreq : number; // uint
		private NumSyms : number; // uint
		private _rc : RangeCoder;

		private Stats : STATISTICS[];

		constructor(rc : RangeCoder) {
			this._rc = rc;
			this.SummFreq = this.EscFreq = 1;
			this.NumSyms = 0;
			this.Stats = new Array(alphabet + 1);
			for (var i = 0; i < alphabet + 1; i++) {
				this.Stats[ i ] = {
					Symbol: i,
					Freq  : 0
				};
			}
		}

		// good
		private sortSymbolsRare() {
			var index = 1,
				p;

			//console.log("sortSymbolsRare start");
			while ((p = this.Stats[ index ]).Freq !== 0) {
				if (this.Stats[ index ].Freq > this.Stats[ index - 1 ].Freq) {
					//console.log("" + index);
					var index1 = index,
						tmp = this.Stats[ index1 ];

					do {
						this.Stats[ index1 ] = this.Stats[ index1 - 1 ];
						index1--;
					} while (index1 > 0 && tmp.Freq > this.Stats[ index1 - 1 ].Freq);
					this.Stats[ index1 ] = tmp;
				}

				index++;
			}
			//console.log("sortSymbolsRare end");
		}

		private rescaleRare() {
			this.sortSymbolsRare();
			this.SummFreq = 0;

			var index = 0,
				p;

			while ((p = this.Stats[ index ]).Freq !== 0) {
				if ((p.Freq >>= 1) !== 0) {
					this.SummFreq += p.Freq;
				} else {
					this.EscFreq++;
					this.NumSyms--;
				}

				index++;
			}
			this.EscFreq -= this.EscFreq >> 1;
			this.SummFreq += this.EscFreq;
		}

		public encodeSymbol(sym : number /* uint */) : void {
			sym = RADIX_64_BASE.indexOf(String.fromCharCode(sym));
			if (this.SummFreq > WSIZ) {
				//console.log("encodeSymbol: rescale");
				this.rescaleRare();
			}

			//STATISTICS* p = Stats-1;
			//while ( (++p)->Symbol!=sym ) LoCount+=p->Freq;

			var LoCount : number = 0,
				index = 0; // uint

			for (; this.Stats[ index ].Symbol !== sym; index++) {
				LoCount += this.Stats[ index ].Freq;
			}
			//console.log("encodeSymbol LoCount = " + LoCount);
			var p = this.Stats[ index ];
			if (!p.Freq) {
				//console.log("Encode1: " + LoCount + "," + this.EscFreq + "," + this.SummFreq);
				this._rc.Encode(LoCount, this.EscFreq, this.SummFreq);
				//console.log("encodeSymbol1 data: " + (index - this.NumSyms) + "," + (256 + 1 - this.NumSyms));
				//console.log("Encode Data: " + index + "," + this.NumSyms);
				this._rc.Encode(index - this.NumSyms, 1, alphabet + 1 - this.NumSyms);
				p.Freq = (STEP / 2) | 0;
				this.EscFreq += (STEP / 2) | 0;
				this.SummFreq += STEP;
				//SWAP(*p,Stats[NumSyms++]);
				this.Stats[ index ] = this.Stats[ this.NumSyms ];
				this.Stats[ this.NumSyms ] = p;
				this.NumSyms++;

				this.sortSymbolsRare();
				//console.log("1");
			} else {
				this._rc.Encode(LoCount, p.Freq, this.SummFreq);
				//console.log("encodeSymbol2 data: " + p.Freq + "," + this.SummFreq);
				p.Freq += STEP;
				this.SummFreq += STEP;
			}
		}

		public decodeSymbol() : number {
			if (this.SummFreq > WSIZ) {
				//console.log("decodeSymbol: rescale");
				this.rescaleRare();
			}

			var	count : number = this._rc.GetFreq(this.SummFreq),
				index,
				p,
				result; // uint

			//console.log("GetFreq: " + count);

			if (count >= this.SummFreq - this.EscFreq) {
				//console.log("Decode 1: " + (this.SummFreq - this.EscFreq) + "," + this.EscFreq + "," + this.SummFreq);
				this._rc.Decode(this.SummFreq - this.EscFreq, this.EscFreq, this.SummFreq);

				index = this.NumSyms + this._rc.GetFreq(alphabet + 1 - this.NumSyms); //STATISTICS* p=Stats+NumSyms+rc_GetFreq(256+1-NumSyms);
				p = this.Stats[ index ];


				var sym : number = p.Symbol; // uint
				//console.log("Decode2: " + (index - this.NumSyms) + "," + 1 + "," + (256 + 1 - this.NumSyms));
				this._rc.Decode(index - this.NumSyms, 1, alphabet + 1 - this.NumSyms);
				//console.log("Decode Data: " + index + "," + this.NumSyms);
				p.Freq = (STEP / 2) | 0;
				this.EscFreq += (STEP / 2) | 0;
				this.SummFreq += STEP;
				//SWAP(*p,Stats[NumSyms++]);
				this.Stats[ index ] = this.Stats[ this.NumSyms ];
				this.Stats[ this.NumSyms ] = p;
				this.NumSyms++;

				this.sortSymbolsRare();

				//console.log("sym = " + sym);
				result = sym;
			} else {
				var HiCount : number = 0; // uint

				index = 0;
				while ((HiCount += this.Stats[ index ].Freq) <= count) index++;

				p = this.Stats[ index ];

				this._rc.Decode(HiCount - p.Freq, p.Freq, this.SummFreq);
				p.Freq += STEP;
				this.SummFreq += STEP;

				//console.log("p.sym = " + p.Symbol);
				result = p.Symbol;
			}

			result = RADIX_64_BASE.charCodeAt(result);
			return result;
		}

	}
}
