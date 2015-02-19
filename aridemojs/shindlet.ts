#define  DO(n)	   for (int _=0; _<n; _++)
#define  TOP	   (1<<24)

class RangeCoder
{
 uint code, range, FFNum, Cache;
 __int64 low;

public:

// inline void ShiftLow( void )
 #define ShiftLow()                              \
 {                                               \
   if ( (low^0xFF000000)>0xFFFFFF ) {            \
     OutTgtByte( Cache + (low>>32) );            \
     int c = 0xFF+(low>>32);                     \
     while( FFNum ) OutTgtByte(c), FFNum--;      \
     Cache = uint(low)>>24;                      \
   } else FFNum++;                               \
   low = uint(low)<<8;                           \
 }


 void StartEncode( void )    
 { low=FFNum=Cache=0;  range=(uint)-1; }

 void StartDecode( void )
 { 
   code=0; 
   range=(uint)-1;
   DO(5) code=(code<<8) | InpSrcByte();
 }

 void FinishEncode( void )	       
 { 
   DO(5) ShiftLow();
 }

 void FinishDecode( void ) {}


 void Encode(uint cumFreq, uint freq, uint totFreq)
 {
   low += cumFreq * (range/= totFreq);
   range*= freq;
   while( range<TOP ) { ShiftLow(); range<<=8; }
 }


 uint GetFreq (uint totFreq) {
   return code / (range/= totFreq);
 }


 void Decode (uint cumFreq, uint freq, uint totFreq)
 {
   code	-= cumFreq*range;
   range*= freq;
   while( range<TOP ) code=(code<<8)|InpSrcByte(), range<<=8;
 }

};

