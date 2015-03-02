#ifndef BOT
#define  BOT	   (1<<16)
#endif

struct ORDER_0_CODER {
    enum { CNUM=256 };
    ORDER_0_CODER();
    void           stopEncode() {}
    void           stopDecode() {}
    uint         decodeSymbol();
    void encodeSymbol(uint sym);
protected:
    void                         rescale();
    inline void updateStatistics(uint sym);
    uint Freq[CNUM], SummFreq;
};
ORDER_0_CODER::ORDER_0_CODER()
{
    for (int i=SummFreq=0;i<CNUM;i++)    SummFreq += (Freq[i]=1);
}
void ORDER_0_CODER::rescale()
{
    for (int i=SummFreq=0;i<CNUM;i++)
            SummFreq += (Freq[i] -= (Freq[i] >> 1));
}
inline void ORDER_0_CODER::updateStatistics(uint sym)
{
    Freq[sym]++;                            SummFreq++;
    if (SummFreq > BOT)                     rescale();
}
void ORDER_0_CODER::encodeSymbol(uint sym)
{
    int i,LowCount;
    for (LowCount=i=0;i < sym;i++)          LowCount += Freq[i];
    rc.Encode(LowCount,Freq[i],SummFreq);
    updateStatistics(sym);
}
uint ORDER_0_CODER::decodeSymbol()
{
    uint sym, HiCount, count=rc.GetFreq(SummFreq);
    for (HiCount=sym=0; ;sym++) {
        HiCount += Freq[sym];
        if (HiCount > count)                break;
    }
    rc.Decode(HiCount-Freq[sym],Freq[sym],SummFreq);
    updateStatistics(sym);
    return sym;
}
