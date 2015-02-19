#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef unsigned int  uint;
typedef unsigned char uc;
/*
#define Model2 // Semenyuk
#define Coderes // CL_D
#define ioD
*/
#include "defines.inc"
#include "tsctimer.inc"

#include IOModel
#include Coder
static RangeCoder rc;
#include Model

void EncodeFile( void )
{
  ORDER_0_CODER o0c;
  int Symbol;
  rc.StartEncode();
  while ( SrcPtr<SrcLen ) o0c.encodeSymbol( InpSrcByte() );
  rc.FinishEncode();
}

void DecodeFile( void )
{
  ORDER_0_CODER o0c;
  int Symbol;
  rc.StartDecode();
  while ( TgtPtr<TgtLen) OutTgtByte( o0c.decodeSymbol() );
  rc.FinishDecode();
}

enum cm { cm_Coding,cm_Decoding };

int main(int argc,char* argv[])
{
  FILE *SourceFile, *TargetFile;
  int NamP=0, Mode=cm_Coding;

  printf("ARIDEMO v1.03 (c) 2000-2001  Dmitry Shkarin, Eugene Shelwien\n");
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

    AllocSrcBuf( SourceFile );

    // encode if command "e"
    if (Mode==cm_Coding)
    {
      AllocTgtBuf( TargetFile, SrcLen+SrcLen );
      printf("Encoding...");
      OutTgtDword( SrcLen );
      StartTimer(),EncodeFile(),CheckTimer();
      printf("\15Encoded Successfully.\n");
    }

    // decode if command "d"
    if (Mode==cm_Decoding)
    {
      printf("Decoding...");
      AllocTgtBuf( TargetFile, InpSrcDword() );
      StartTimer(),DecodeFile(),CheckTimer();
      printf("\15Decoded Successfully.\n");
    }

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
  printf("  /r - As previous, but yet more save it into file\n");

  return -1;
}

