// Input/Output using dynamic memory allocation

uc* SourceBuf; uint SrcPtr=0, SrcLen;
uc* TargetBuf; uint TgtPtr=0, TgtLen;

inline void OutTgtByte( uc c ) { *(TargetBuf+(TgtPtr++))=c; }
inline uc   InpSrcByte( void ) { return *(SourceBuf+(SrcPtr++)); }

inline void OutTgtDword( uint c ) { *((uint*)(TargetBuf+(TgtPtr+=4)-4))=c; }
inline uint InpSrcDword( void )   { return *((uint*)(SourceBuf+(SrcPtr+=4)-4)); }

uint flen( FILE* f )
{
  fseek( f, 0, SEEK_END );
  uint len = ftell(f);
  fseek( f, 0, SEEK_SET );
  return len;
}

inline void AllocSrcBuf( FILE* SourceFile )
{
  SrcLen = flen(SourceFile);
  SourceBuf = new uc[SrcLen];
  fread( SourceBuf, SrcLen, 1, SourceFile );
}

inline void AllocTgtBuf( FILE* TargetFile, uint len )
{
  TgtLen = len;
  TargetBuf = new uc[len];
}

inline void FlushTgtBuf( FILE* TargetFile )
{
  fwrite(TargetBuf, TgtPtr, 1, TargetFile);
}

module ARIDEMO  {
	class IO_RAMD {
		private _sourcePosition : number;
		private _source : number[];
		private _target : number[];
		constructor (data : number[]) {
			this._sourcePosition = 0;
			this._source = data;
			this._target = [];
		}

		public writeByte(byte : number) {
			this._target.push(byte);
		}

		public writeDWORD(dword : number) {
			this.writeByte(dword & 0xFF);
			this.writeByte((dword>>8) & 0xFF);
			this.writeByte((dword>>16) & 0xFF);
			this.writeByte((dword>>24) & 0xFF);
		}

		public readByte(byte : number) {
			return this._source[this._sourcePosition++];
		}

		public writeDWORD(dword : number) {
			this.writeByte(dword & 0xFF);
			this.writeByte((dword>>8) & 0xFF);
			this.writeByte((dword>>16) & 0xFF);
			this.writeByte((dword>>24) & 0xFF);
		}

		public readDWORD(byte : number) {
			var b1 = this.readByte(),
				b2 = this.readByte(),
				b3 = this.readByte(),
				b4 = this.readByte();

			return b1 + (b2 << 8) + (b3 << 16) + (b4 << 24);
		}

	}
}
