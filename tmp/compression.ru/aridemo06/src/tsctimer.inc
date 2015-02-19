static __int64 TSCTimer;
// 0 = No timing at all; 1 = Print timing; 2 = Print & write to file
uint TSCFlag=0; 

void StartTimer( void )
{
  if (TSCFlag>0)
  _asm		{
		rdtsc
		mov dword ptr TSCTimer+0,eax
		mov dword ptr TSCTimer+4,edx
		}
}

void CheckTimer( void )
{
  if (TSCFlag>0)
  _asm		{
		rdtsc
		sub eax,dword ptr TSCTimer+0
		sbb edx,dword ptr TSCTimer+4
		mov dword ptr TSCTimer+0,eax
		mov dword ptr TSCTimer+4,edx
		}
}

void PrintTimer( void )
{
  if (TSCFlag>0)
  printf("dTSC=%08X%08X\n",*(uint*)((uc*)(&TSCTimer)+4),(uint)TSCTimer);
 
  if (TSCFlag==2)
  {
    FILE* TimeStamp=fopen("rkgraph.tim","wb");
    fwrite( &TSCTimer, 8, 1, TimeStamp );
    fclose( TimeStamp );
  }

}
