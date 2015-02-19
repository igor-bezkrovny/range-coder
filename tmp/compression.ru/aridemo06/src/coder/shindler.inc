#define  DO(n)	   for (int _=0; _<n; _++)
#define  TOP	   (1<<24)
#define  BOT	   (1<<16)

class RangeCoder
{
 uint  low, code, range, FFNum, Cache, Carry;

public:

 void StartEncode( void )    
 { low=FFNum=Cache=Carry=0;  range=(uint)-1; }

 void StartDecode( void )
 { 
   low=code=0; 
   range=(uint)-1;
   DO(5) code=(code<<8) | InpSrcByte();
 }

 void FinishEncode( void )	       
 { 
   low+=1; if (low==0) Carry++;
   DO(5) ShiftLow();
 }

 void FinishDecode( void ) {}


 void Encode(uint cumFreq, uint freq, uint totFreq)
 {
   uint tmp=low;
   low += cumFreq * (range/= totFreq);
   if (low<tmp) Carry++;
   range*= freq;

   while ( range<TOP )
   {
     range <<= 8;
     ShiftLow();
   }
 }

 inline void ShiftLow( void )
 {
   if ( Carry==0 )
     if ( low<(uint)0xFF000000 )
     {
       OutTgtByte( Cache );
       for (;FFNum != 0;FFNum--) OutTgtByte(0xFF);
       Cache = low>>24;
     } else FFNum++;
   else {
     OutTgtByte( Cache+1 ); Carry=0;
     for (;FFNum != 0;FFNum--) OutTgtByte(0x00);
     Cache = low>>24;
   }
   low <<= 8;
 }


 uint GetFreq (uint totFreq) {
   return (code-low) / (range/= totFreq);
 }


 void Decode (uint cumFreq, uint freq, uint totFreq)
 {
   low	+= cumFreq*range;
   range*= freq;
   while ( range<TOP )
   {
     code = (code<<8) | InpSrcByte();
     low <<= 8;
     range <<= 8;
   }
 }

};

