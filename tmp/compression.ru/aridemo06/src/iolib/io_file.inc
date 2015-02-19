// Input/Output using dynamic memory allocation

FILE* SourceBuf; uint SrcPtr=0, SrcLen;
FILE* TargetBuf; uint TgtPtr=0, TgtLen;

inline void OutSrcByte( uc c ) { fputc(c,SourceBuf); SrcPtr++; }
inline void OutTgtByte( uc c ) { fputc(c,TargetBuf); TgtPtr++; }
inline uc   InpSrcByte( void ) { SrcPtr++; return fgetc(SourceBuf); }
inline uc   InpTgtByte( void ) { TgtPtr++; return fgetc(TargetBuf); }

inline void OutSrcDword( uint c ) 
  { fwrite( &c, 4, 1, SourceBuf ); SrcPtr+=4; }
inline void OutTgtDword( uint c ) 
  { fwrite( &c, 4, 1, TargetBuf ); TgtPtr+=4; }
inline uint InpSrcDword( void )   
  { uint c; fread( &c, 4, 1, SourceBuf); SrcPtr+=4; return c; }
inline uint InpTgtDword( void )
  { uint c; fread( &c, 4, 1, TargetBuf); TgtPtr+=4; return c; }

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
  SourceBuf = SourceFile;
//  fread( SourceBuf, SrcLen, 1, SourceFile );
}

inline void AllocTgtBuf( FILE* TargetFile, uint len )
{
  TgtLen = len;
  TargetBuf = TargetFile;
}

inline void FlushTgtBuf( FILE* TargetFile )
{
//  fwrite(TargetBuf, TgtPtr, 1, TargetFile);
}

