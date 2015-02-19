// Input/Output using static memory allocation (4M per source and target)

uc SourceBuf[1<<22]; uint SrcPtr=0, SrcLen;
uc TargetBuf[1<<22]; uint TgtPtr=0, TgtLen;

inline void OutSrcByte( uc c ) { *(SourceBuf+(SrcPtr++))=c; }
inline void OutTgtByte( uc c ) { *(TargetBuf+(TgtPtr++))=c; }
inline uc   InpSrcByte( void ) { return *(SourceBuf+(SrcPtr++)); }
inline uc   InpTgtByte( void ) { return *(TargetBuf+(TgtPtr++)); }

inline void OutSrcDword( uint c ) { *((uint*)(SourceBuf+(SrcPtr+=4)-4))=c; }
inline void OutTgtDword( uint c ) { *((uint*)(TargetBuf+(TgtPtr+=4)-4))=c; }
inline uint InpSrcDword( void )   { return *((uint*)(SourceBuf+(SrcPtr+=4)-4)); }
inline uint InpTgtDword( void )   { return *((uint*)(TargetBuf+(TgtPtr+=4)-4)); }

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
//  SourceBuf = new uc[SrcLen];
  fread( SourceBuf, SrcLen, 1, SourceFile );
}

inline void AllocTgtBuf( FILE* TargetFile, uint len )
{
  TgtLen = len;
//  TargetBuf = new uc[len];
}

inline void FlushTgtBuf( FILE* TargetFile )
{
  fwrite(TargetBuf, TgtPtr, 1, TargetFile);
}

