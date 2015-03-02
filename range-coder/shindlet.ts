///<reference path="./io_ramd.ts"/>
module RANGECODER {
	var v2in32 : number = Math.pow(2, 32);
	var v2in24 : number = Math.pow(2, 24);
	var TOP : number = Math.pow(2, 24);

	export class RangeCoder {
		private code : number;
		private range : number;
		private FFNum : number;
		private Cache : number;

		private low : number;
		private _io : IO;

		constructor(io : IO) {
			this._io = io;
		}
		public shiftLow() : void {
			var l = Math.floor(this.low % v2in32) >>> 24,
				h = Math.floor(this.low / v2in32);

			if (h > 0 || l < 255) {
				var t = Math.floor(this.low / v2in32);
				this._io.writeByte(this.Cache + t);
				var c : number = 255 + t; // int
				//console.log("shiftLow first " + this.low + "," + c);
				while (this.FFNum) {
					this._io.writeByte(c);
					this.FFNum--;
				}
				this.Cache = Math.floor((this.low % v2in32) / v2in24);
				//console.log("shiftLow cash " + this.Cache);
			} else {
				//console.log("shiftLow second " + this.low);
				this.FFNum++;
			}
			//console.log("shiftLow test " + this.low + ", " + (this.low & 0xFFFFFFFF) + "," + ((this.low * 256 ) | 0));
			this.low = (this.low * 256) % v2in32;
			//console.log("shiftLow third " + this.low);
		}

		public StartEncode() : void {
			this.low = this.FFNum = this.Cache = 0;
			this.range = v2in32 - 1;
		}

		public StartDecode() : void {
			this.code = 0;
			this.range = v2in32 - 1;
			for (var i = 0; i < 5; i++) this.code = (this.code * 256) + this._io.readByte();
		}

		public FinishEncode() : void {
			//console.log("finish encode");
			for (var i = 0; i < 5; i++) this.shiftLow();
		}

		public FinishDecode() : void {
		}

		public Encode(cumFreq : number /* uint */, freq : number /* uint */, totFreq : number /* uint */) : void {
			this.range = Math.floor(this.range / totFreq);
			this.low += cumFreq * this.range;
			this.range *= freq;
			while (this.range < TOP) {
				this.shiftLow();
				this.range *= 256;
			}
			//console.log("encode end: " + this.range + "," + cumFreq + "," + freq + "," + totFreq);
		}

		public GetFreq(totFreq : number /* uint */) : number /* uint */ {
			//console.log("totFreq: " + totFreq + ", range: " + this.range + ", code = " + this.code);
			this.range = Math.floor(this.range / totFreq);
			return Math.floor(this.code / this.range);
		}

		public Decode(cumFreq : number /* uint  */, freq : number /* uint  */, totFreq : number /* uint  */) : void {
			this.code -= cumFreq * this.range;
			this.range *= freq;
			while (this.range < TOP) {
				this.code = (this.code * 256) + this._io.readByte();
				this.range *= 256;
			}

		}

	}
}
