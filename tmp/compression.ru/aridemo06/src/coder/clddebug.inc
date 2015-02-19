/*
 uint Debug1[2], Debug2[2];
#define BugLoc	0x358C91
#define BugShow 0x358C00

 void DebugPrint( void )
 {
    _asm		{
			fld	st(0)
			fistp	qword ptr Debug1
			fld	st(1)
			fistp	qword ptr Debug2
			}
if (Debug2[1]==0x80000000)
{
  _asm			{
			fld	st(1)
			fsub	dword ptr rc_1shl63
			fistp	qword ptr Debug2
			or	dword ptr Debug2+4,80000000h
			}
}

if (TgtPtr==BugLoc) printf("*** \n");
if (TgtPtr>=BugShow)
    printf("%08X%08X, %08X%08X\n",Debug1[1],Debug1[0],Debug2[1],Debug2[0]);

if (SrcPtr-1==BugLoc) printf("*** \n");
if (SrcPtr-1>=BugShow)
    printf("%08X%08X, %08X%08X\n",Debug1[1],Debug1[0],Debug2[1],Debug2[0]);



 }
*/
