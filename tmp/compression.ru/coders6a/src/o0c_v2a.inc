#define  WSIZ	   (1<<11)

template <class TMP_TYPE>
  inline void SWAP(TMP_TYPE& t1,TMP_TYPE& t2) 
  { TMP_TYPE tmp=t1; t1=t2; t2=tmp; }

struct ORDER_0_CODER 
{
  enum { STEP=8 };

  ORDER_0_CODER();
  inline void encodeSymbol(uint sym);
  inline uint decodeSymbol();
protected:
  void   rescaleRare();
  void   sortSymbolsRare();

  uint SummFreq, EscFreq, NumSyms, dummy;
  struct STATISTICS { uint Symbol, Freq; } Stats[256+1];
};


ORDER_0_CODER::ORDER_0_CODER()
{
  SummFreq=EscFreq=1;
  NumSyms=0;
  for ( int i=0; i<256+1; i++ ) 
  {
    Stats[i].Symbol = i;
    Stats[i].Freq   = 0;
  }
}


void ORDER_0_CODER::sortSymbolsRare()
{
  for (STATISTICS* p=Stats+1;p->Freq != 0;p++)
  {
    if (p[0].Freq > p[-1].Freq) {
      STATISTICS* p1, tmp=*(p1=p);
      do { 
        p1[0]=p1[-1]; 
      } while (--p1 != Stats && tmp.Freq > p1[-1].Freq);
      *p1=tmp;
    }
  }
}


void ORDER_0_CODER::rescaleRare()
{
  sortSymbolsRare();            
  SummFreq=0;
  for ( STATISTICS* p=Stats; p->Freq!=0; p++ )
  {
    if ( (p->Freq>>=1)!=0 )   
      SummFreq += p->Freq;
    else 
      EscFreq++, NumSyms--;
  }
  EscFreq  -= (EscFreq>>1);        
  SummFreq += EscFreq;
}


inline void ORDER_0_CODER::encodeSymbol(uint sym)
{
  if ( SummFreq>WSIZ ) rescaleRare();

  uint LoCount  = 0;             
  STATISTICS* p = Stats-1;

  while ( (++p)->Symbol!=sym ) LoCount+=p->Freq;

  if ( !p->Freq ) 
  {
    rc_Encode(LoCount,EscFreq,SummFreq);
    rc_Encode((p-Stats)-NumSyms,1,256+1-NumSyms);
    p->Freq = STEP/2;         
    EscFreq += STEP/2;
    SummFreq += STEP;         
    SWAP(*p,Stats[NumSyms++]);
    sortSymbolsRare();          
  } else {
    rc_Encode(LoCount,p->Freq,SummFreq);
    p->Freq += STEP;            
    SummFreq += STEP;
  }
}


inline uint ORDER_0_CODER::decodeSymbol()
{
  if ( SummFreq>WSIZ) rescaleRare();

  uint count=rc_GetFreq(SummFreq);

  if (count >= SummFreq-EscFreq) 
  {
    rc_Decode(SummFreq-EscFreq,EscFreq,SummFreq);
    STATISTICS* p=Stats+NumSyms+rc_GetFreq(256+1-NumSyms);
    uint sym=p->Symbol;
    rc_Decode((p-Stats)-NumSyms,1,256+1-NumSyms);
    p->Freq   = STEP/2;         
    EscFreq  += STEP/2;
    SummFreq += STEP;         
    SWAP(*p,Stats[NumSyms++]);
    sortSymbolsRare();          
    return sym;
  } else {
    uint HiCount=0;             
    STATISTICS* p=Stats;
    while ( (HiCount+=p->Freq)<=count) p++;
    rc_Decode(HiCount-p->Freq,p->Freq,SummFreq);
    p->Freq += STEP;            
    SummFreq += STEP;
    return p->Symbol;
  }
}
