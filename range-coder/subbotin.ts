///<reference path="./io_ramd.ts"/>
module RANGECODER {

	var v2in32 : number = Math.pow(2, 32);
	var v2in24 : number = Math.pow(2, 24);
	var TOP : number = Math.pow(2, 24);
	var BOT : number = Math.pow(2, 16);

	export class RangeCoder {
		private low : number;
		private code : number;
		private range : number;
		private _io : IO;

		constructor(io : IO) {
			this._io = io;
		}

		public StartEncode() : void {
			this.low = 0;
			this.range = v2in32 - 1;
		}

		public StartDecode() : void {
			this.low = this.code = 0;
			this.range = v2in32 - 1;
			for (var i = 0; i < 4; i++) this.code = ((this.code * 256) + this._io.readByte()) % v2in32;
		}

		public FinishEncode() : void {
			for (var i = 0; i < 4; i++) {
				this._io.writeByte(this.low >>> 24);
				this.low *= 256;
			}
		}

		public FinishDecode() : void {
		}

		public Encode(cumFreq : number /* uint */, freq : number /* uint */, totFreq : number /* uint */) {
			this.range = Math.floor(this.range / totFreq);
			this.low = (this.low + cumFreq * this.range) % v2in32;
			this.range = (this.range * freq) % v2in32;
			while (((this.low >>> 24) ^ ((this.low + this.range) >>> 24)) === 0 || this.range < BOT && ((this.range = (-this.low) & (BOT - 1)), 1)) {
				this._io.writeByte(this.low >>> 24);
				this.range = (this.range * 256) % v2in32;
				this.low = (this.low * 256) % v2in32;
			}
		}

		public GetFreq(totFreq : number) : number {
			this.range = Math.floor(this.range / totFreq);
			return Math.floor((this.code - this.low) / this.range);
		}

		public Decode(cumFreq : number /* uint */, freq : number /* uint */, totFreq : number /* uint */) {
			this.low = (this.low + cumFreq * this.range) % v2in32;
			this.range = (this.range * freq) % v2in32;
			while (((this.low >>> 24) ^ ((this.low + this.range) >>> 24)) === 0 || this.range < BOT && ((this.range = (-this.low) & (BOT - 1)), 1)) {
				this.code = ((this.code * 256) + this._io.readByte()) % v2in32;
				this.range = (this.range * 256) % v2in32;
				this.low = (this.low * 256) % v2in32;
			}
		}

	}
}
