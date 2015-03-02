#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef unsigned int  uint;
typedef unsigned char uc;

#include "tsctimer.inc"

#define  IOModel "io_ramd.inc"
#define  Model   "o0c_v2a.inc"

//#define  Coder   "beeari.cdr"
#define  Coder   "clrf.cdr"
//#define  Coder   "clr.cdr"
//#define  Coder   "shindlet.cdr"
//#define  Coder   "shcoder.cdr"
//#define  Coder   "CLD-A2.cdr"
//#define  Coder   "subbotin.cdr"
//#define  Coder   "subb_lb.cdr"

#include IOModel
#include Coder
static RangeCoder rc;

#ifndef rc_StartEncode
#define rc_StartEncode  rc.StartEncode
#define rc_FinishEncode rc.FinishEncode
#define rc_StartDecode  rc.StartDecode
#define rc_FinishDecode rc.FinishDecode
#define rc_Encode       rc.Encode
#define rc_Decode       rc.Decode
#define rc_GetFreq      rc.GetFreq
#endif

#include Model


void EncodeFile( void )
{
  ORDER_0_CODER o0c;
  int Symbol;
  rc_StartEncode();
  while ( SrcPtr<SrcLen ) o0c.encodeSymbol( InpSrcByte() );

//  for( int i=0; i<2; i++ ) rc.Encode( (1<<24)-1,1,(1<<24) );

  rc_FinishEncode();
}

void DecodeFile( void )
{
  ORDER_0_CODER o0c;
  int Symbol;
  rc_StartDecode();
  while ( TgtPtr<TgtLen) OutTgtByte( o0c.decodeSymbol() );
  rc_FinishDecode();
}

/*
#define EncodeFile() ProcessFile(1)

#define DecodeFile() ProcessFile(0)

void ProcessFile( int Action )
{
  rc_StartEncode()

  #include Model
  ORDER_0_CODER o0c;
  int Symbol;
 
  if (Action) {
    while ( SrcPtr<SrcLen ) o0c.encodeSymbol( InpSrcByte() );
    rc_FinishEncode();
  } else {
    while ( TgtPtr<TgtLen) OutTgtByte( o0c.decodeSymbol() );
    rc_FinishDecode();
  }

}
*/

enum cm { cm_Coding,cm_Decoding };

int main(int argc,char* argv[])
{
  FILE *SourceFile, *TargetFile;
  int NamP=0, Mode=cm_Coding;

  printf("ARIDEMO v1.04 (c) 2000-2001  Dmitry Shkarin, Eugene Shelwien\n");
  printf("Includes: %s, %s, %s\n",IOModel,Coder,Model);

  do{
    // eat commands and find filename
    NamP++;
    if (argc<=NamP) break;
    if (!strcmp(argv[NamP],"e")) { Mode=cm_Coding; continue; }
    if (!strcmp(argv[NamP],"d")) { Mode=cm_Decoding; continue; }
    if (!strcmp(argv[NamP],"/t")){ TSCFlag=1; continue; }
    if (!strcmp(argv[NamP],"/r")){ TSCFlag=2; continue; }

    // try to open source filename
    if (!(SourceFile=fopen(argv[NamP],"rb")))
    { printf("Cannot open source file\n"); break; }

    // try to create target file
    NamP++;
    if ( argc>NamP ?
      !(TargetFile=fopen(argv[NamP],"wb")) :
      Mode==cm_Coding ?
	!(TargetFile=fopen("aridemo.ari","wb")) :
	!(TargetFile=fopen("aridemo.unp","wb"))
    ) { printf("Cannot create target file\n"); break; }

    StartTimer();

    AllocSrcBuf( SourceFile );

    // encode if command "e"
    if (Mode==cm_Coding)
    {
      AllocTgtBuf( TargetFile, SrcLen+SrcLen );
      printf("Encoding...");
      OutTgtDword( SrcLen );
      EncodeFile();
      printf("\15Encoded Successfully.\n");
    }

    // decode if command "d"
    if (Mode==cm_Decoding)
    {
      printf("Decoding...");
      AllocTgtBuf( TargetFile, InpSrcDword() );
      DecodeFile();
      printf("\15Decoded Successfully.\n");
    }

    CheckTimer();
    PrintTimer();

    FlushTgtBuf( TargetFile );
    fclose( SourceFile );
    fclose( TargetFile );

    return 0;
  }while(1);

  // print usage on errors
  printf("Usage:\n");
  printf("  %s [e|d] [/t|/r] SourceFile [TargetFile]\n", argv[0] );
  printf("  /t - Show the number of CPU clocks spent by coding\n");
  printf("  /r - As previous, but write it to file yet\n");

  return -1;
}

