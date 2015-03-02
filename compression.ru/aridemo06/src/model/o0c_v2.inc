#ifndef BOT
#define  BOT	   (1<<16)
#endif

template <class TMP_TYPE>
inline void SWAP(TMP_TYPE& t1,TMP_TYPE& t2) { TMP_TYPE tmp=t1; t1=t2; t2=tmp; }
struct ORDER_0_CODER {
    enum { CNUM=257 };
    ORDER_0_CODER();
    void                  stopEncode() {}
    void		  stopDecode() {}
    inline void encodeSymbol(int sym);
    inline uint decodeSymbol();
protected:
    void		     rescale();
    uint NumStats, SummFreq, Freq[CNUM];
};
ORDER_0_CODER::ORDER_0_CODER()
{
    for (int i=1;i<CNUM;i++) Freq[i]=0;
    NumStats=1;
    Freq[0]=SummFreq=1;
}
void ORDER_0_CODER::rescale()
{
    int AuxEsc=0;
    SummFreq=(Freq[0] -= (Freq[0] >> 1));
    for (int i=NumStats=1;i<CNUM;i++) {
	AuxEsc += (Freq[i] == 1);
	SummFreq += (Freq[i] >>= 1);	    NumStats += (Freq[i] != 0);
    }
    AuxEsc -= (AuxEsc >> 1);
    SummFreq += AuxEsc; 		    Freq[0] += AuxEsc;
}
inline void ORDER_0_CODER::encodeSymbol(int sym)
{
    if (SummFreq > BOT) 		    rescale();
    uint i, LowCount;
    if ( Freq[++sym] ) {
	for (LowCount=i=0;i < sym;i++)	    LowCount += Freq[i];
	rc.Encode(LowCount,Freq[i],SummFreq);
	SummFreq += 16; 		    Freq[sym] += 16;
    } else {
	rc.Encode(0,Freq[0],SummFreq);
	for (LowCount=i=0;i < sym;i++)	    LowCount += (Freq[i] == 0);
	rc.Encode(LowCount,1,CNUM-NumStats);
	SummFreq += 16; 		    
        Freq[sym] += 8;
	Freq[0] += 8;			    
        NumStats++;
    }
}

inline uint ORDER_0_CODER::decodeSymbol()
{
  if (SummFreq > BOT) rescale();
  uint sym, low, value = rc.GetFreq(SummFreq);
  if (value>=Freq[0]) {
    for (sym=1,low=Freq[0];sym<CNUM;sym++){
      if (value<low+Freq[sym]) break;
      low+=Freq[sym];
    }
    rc.Decode(low,Freq[sym],SummFreq);
    SummFreq += 16;
    Freq[sym] += 16;
  } else {
    rc.Decode(0,Freq[0],SummFreq);
    value = rc.GetFreq(CNUM-NumStats);
    for (sym=1,low=0;sym<CNUM;sym++){
      if (Freq[sym]==0) low++;
      if (low>value) break;
    }
    rc.Decode(low-1,1,CNUM-NumStats);
    SummFreq += 16;
    Freq[sym] += 8;
    Freq[0] += 8;
    NumStats++;
  }
  return sym-1;
}

