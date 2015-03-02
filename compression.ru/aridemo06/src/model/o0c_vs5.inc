// Model by V.Semenyuk of 02/03/2001

#define INC 8
#define TOTAL_LIMIT (1<<16)

#define resc(x) x-=x>>1

class ORDER_0_CODER
{
  uint tree[383];
  uint totFreq;

public:

  ORDER_0_CODER()
  {
    for (uint i=127; i<383; i++) tree[i] = 2;
    Rescale();
  }

  void stopDecode() {}

  void stopEncode() {}

  void encodeSymbol(uint sym)
  {
    uint cumFreq;
    uint freq;

    if ( totFreq>TOTAL_LIMIT ) Rescale();

    if (sym&128) cumFreq=tree[0];
    else cumFreq=0, tree[0]+=INC;
    if (sym&64) cumFreq+=tree[1+(sym>>7)];
    else tree[1+(sym>>7)]+=INC;
    if (sym&32) cumFreq+=tree[3+(sym>>6)];
    else tree[3+(sym>>6)]+=INC;
    if (sym&16) cumFreq+=tree[7+(sym>>5)];
    else tree[7+(sym>>5)]+=INC;
    if (sym&8) cumFreq+=tree[15+(sym>>4)];
    else tree[15+(sym>>4)]+=INC;
    if (sym&4) cumFreq+=tree[31+(sym>>3)];
    else tree[31+(sym>>3)]+=INC;
    if (sym&2) cumFreq+=tree[63+(sym>>2)];
    else tree[63+(sym>>2)]+=INC;

    uint * p;

    if (sym&1)
    {
      cumFreq+=*(p=tree+126+sym);
      freq = *(++p);
    }
    else freq = *(p=tree+127+sym);

    *p+=INC;

    rc.Encode(cumFreq,freq,totFreq);

    totFreq+=INC; 
  }

  uint decodeSymbol()
  {
    uint decFreq;
    uint savedFreq = decFreq = rc.GetFreq(totFreq);

    if ( totFreq>TOTAL_LIMIT ) Rescale();

    uint freq;

    uint sym;

    uint * p;

    if (decFreq<tree[0])
    {
      tree[0]+=INC;
      sym = 0;
    }
    else
    {
      decFreq-=tree[0];
      sym = 1;
    }

    if (decFreq<*(p=tree+1+sym))
    {
      *p+=INC;
      sym<<=1;
    }
    else
    {
      decFreq-=*p;
      sym=(sym<<1)+1;
    }

    if (decFreq<*(p=tree+3+sym))
    {
      *p+=INC;
      sym<<=1;
    }
    else
    {
      decFreq-=*p;
      sym=(sym<<1)+1;
    }

    if (decFreq<*(p=tree+7+sym))
    {
      *p+=INC;
      sym<<=1;
    }
    else
    {
      decFreq-=*p;
      sym=(sym<<1)+1;
    }

    if (decFreq<*(p=tree+15+sym))
    {
      *p+=INC;
      sym<<=1;
    }
    else
    {
      decFreq-=*p;
      sym=(sym<<1)+1;
    }

    if (decFreq<*(p=tree+31+sym))
    {
      *p+=INC;
      sym<<=1;
    }
    else
    {
      decFreq-=*p;
      sym=(sym<<1)+1;
    }

    if (decFreq<*(p=tree+63+sym))
    {
      *p+=INC;
      sym<<=1;
    }
    else
    {
      decFreq-=*p;
      sym=(sym<<1)+1;
    }

    if (decFreq<*(p=tree+127+(sym<<=1))) freq = *p;
    else
    {
      decFreq-=*p;
      freq=*(++p);
      sym++;
    }

    *p+=INC;

    rc.Decode(savedFreq-decFreq,freq,totFreq);

    totFreq+=INC; 

    return sym;
  }

  ~ORDER_0_CODER() {}

protected:

  void Rescale()
  {
    memset(tree,0,127*4);

    totFreq = 0;

    for (uint sym = 0; sym<256; sym++)
    {
//      if (!(tree[127+sym]>>=1)) tree[127+sym]=1;
   
      tree[127+sym]-=tree[127+sym]>>1;
      uint freq = tree[127+sym];

      if (!(sym&128)) tree[0]+=freq;
      if (!(sym&64)) tree[1+(sym>>7)]+=freq;
      if (!(sym&32)) tree[3+(sym>>6)]+=freq;
      if (!(sym&16)) tree[7+(sym>>5)]+=freq;
      if (!(sym&8)) tree[15+(sym>>4)]+=freq;
      if (!(sym&4)) tree[31+(sym>>3)]+=freq;
      if (!(sym&2)) tree[63+(sym>>2)]+=freq;

      totFreq+=freq;
    }
  }


};

