// *** Dword-oriented Rangecoder by Eugene D. Shelwien -- Plain C++

uint rc_FFNum;		// number of all-F dwords between Cache and Low
uint rc_LowH;		// high 32bits of Low
uint rc_Cache;		// cached low dword
uint rc_Carry;		// Low carry flag

class RangeCoder
{
unsigned __int64 Range;
union{
unsigned __int64 Low;
unsigned __int64 Code;
};

public:

 void StartEncode ()
 {
   rc_Cache=0;
   rc_FFNum=0;
   Range = 0x7FFFFFFFFFFFFFFF;
   Low = 0;
 }


 void StartDecode()
 {
   rc_Carry = 0;
   Range = 0x7FFFFFFFFFFFFFFF;
   Code = 0;
   ShiftCode();
   ShiftCode();
   ShiftCode();
 }


 void FinishEncode( void )
 {
   Low+=1;
   ShiftLow();
   ShiftLow();
   ShiftLow();
 }


 void FinishDecode( void ){}


 inline void Encode(uint cumFreq, uint freq, uint totFreq)
 {
   Range/= totFreq;
   Low  += Range*cumFreq;
   Range*= freq;
   if (Range<0x80000000)
   {
     Range<<=32;
     ShiftLow();
   }
 }


 inline void ShiftLow( void )
 {
   rc_Carry = (Low>>63) & 1;
   Low &= 0x7FFFFFFFFFFFFFFF;
   rc_LowH  = Low>>31;
   if ( (rc_Carry==1) || (rc_LowH<0xFFFFFFFF) )
   {
     OutTgtDword( rc_Cache+rc_Carry );
     for(;rc_FFNum>0;rc_FFNum--) OutTgtDword( 0xFFFFFFFF+rc_Carry );//FFNum=0
     rc_Cache  = rc_LowH;
   } else {
     rc_FFNum++; // count new FF
   }
   Low = (Low & 0x7FFFFFFF)<<32;
 }


 inline uint GetFreq (uint totFreq)
 {
   return Code/(Range/totFreq);
 }


 inline void Decode (uint cumFreq, uint freq, uint totFreq)
 {
   Range/= totFreq;
   Code -= Range*cumFreq;
   Range*= freq;
   if (Range<0x80000000)
   {
     Range<<=32;
     ShiftCode();
   }

 }

 inline void ShiftCode( void )
 {
   rc_Cache = InpSrcDword();
   Code = (Code<<32)+rc_Carry+(rc_Cache>>1);
   rc_Carry = rc_Cache<<31;
 }


};

