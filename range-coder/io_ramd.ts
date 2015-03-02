module RANGECODER  {
	export class IO {
		private _sourcePosition : number;
		private _source : number[];
		private _target : number[];
		constructor (data : number[]) {
			this._sourcePosition = 0;
			this._source = data;
			this._target = [];
		}

		public writeByte(byte : number) : void {
			//console.log("writeByte: l=" + this._target.length + ", b=" + byte);
			this._target.push(byte);
		}

		public readByte() : number {
			//console.log("readByte: l=" + this._source.length + ", pos=" + this._sourcePosition + ", b=" + this._source[this._sourcePosition]);
			return this._source[this._sourcePosition++];
		}

		public writeDWORD(dword : number) : void {
			this.writeByte(dword & 0xFF);
			this.writeByte((dword>>8) & 0xFF);
			this.writeByte((dword>>16) & 0xFF);
			this.writeByte((dword>>24) & 0xFF);
		}

		public readDWORD() : number {
			var b1 = this.readByte(),
				b2 = this.readByte(),
				b3 = this.readByte(),
				b4 = this.readByte();

			return b1 + (b2 << 8) + (b3 << 16) + (b4 << 24);
		}

		public getResult() : number[] {
			return this._target;
		}

		public isEOF () : boolean {
			return this._sourcePosition >= this._source.length;
		}

	}
}
