#ifndef BOT
#define  BOT	   (1<<16)
#endif

template <class TMP_TYPE>
inline void SWAP(TMP_TYPE& t1,TMP_TYPE& t2) { TMP_TYPE tmp=t1; t1=t2; t2=tmp; }

struct ORDER_0_CODER {
    enum { CNUM=256 };
    ORDER_0_CODER();
    inline void encodeSymbol(uint sym);
    void                  stopEncode() {}
    void                  stopDecode() {}
    inline uint         decodeSymbol();
protected:
    void                         rescale();
    uint SummFreq;
    struct STATISTICS { uint Symbol, Freq; } Stats[CNUM];
};
ORDER_0_CODER::ORDER_0_CODER()
{
    SummFreq=CNUM;
    for ( int i=0; i<CNUM; i++ ) {
        Stats[i].Symbol=i;                  Stats[i].Freq=1;
    }
}
void ORDER_0_CODER::rescale()
{
    SummFreq = (Stats[0].Freq -= (Stats[0].Freq >> 1));
    for (int i=1;i<CNUM; i++) {
        SummFreq += (Stats[i].Freq -= (Stats[i].Freq >> 1));
        if (Stats[i].Freq > Stats[i-1].Freq) {
            STATISTICS* p1, tmp=*(p1=Stats+i);
            do { p1[0]=p1[-1]; } while (--p1 != Stats && tmp.Freq > p1[-1].Freq);
            *p1=tmp;
        }
    }
}
inline void ORDER_0_CODER::encodeSymbol(uint sym)
{
    if (SummFreq > BOT)                     rescale();
    if (sym == Stats->Symbol) {
        rc.Encode(0,Stats->Freq,SummFreq);
        Stats->Freq += 8;                   SummFreq += 8;
        return;
    }
    uint LowCount=0;                        STATISTICS* p=Stats;
    do { LowCount += p->Freq; } while ((++p)->Symbol != sym);
    rc.Encode(LowCount,p->Freq,SummFreq);
    p->Freq += 8;                           SummFreq += 8;
    if (p[0].Freq > p[-1].Freq)             SWAP(p[0],p[-1]);
}
inline uint ORDER_0_CODER::decodeSymbol()
{
    if (SummFreq > BOT)                     rescale();
    uint sym, HiCount, count=rc.GetFreq(SummFreq);
    if (count < Stats->Freq) {
        rc.Decode(0,Stats->Freq,SummFreq);
        Stats->Freq += 8;                   SummFreq += 8;
        return Stats->Symbol;
    }
    HiCount=Stats->Freq;                    STATISTICS* p=Stats;
    do { p++; } while ((HiCount += p->Freq) <= count);
    sym=p->Symbol;
    rc.Decode(HiCount-p->Freq,p->Freq,SummFreq);
    p->Freq += 8;                           SummFreq += 8;
    if (p[0].Freq > p[-1].Freq)             SWAP(p[0],p[-1]);
    return sym;
}
