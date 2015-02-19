// Model by V.Semenyuk of 01/03/2001

#define INC 16
#define TOTAL_LIMIT ((1<<16)-INC-1)

class ORDER_0_CODER
{
  uint tree[383];
  uint totFreq;

public:

  ORDER_0_CODER()
  {
    uint i;
    for (i=127; i<383; i++) tree[i] = 1;
    totFreq = 256+1;
    BuildTree();
  }

  void stopDecode() {}

  void stopEncode() {}

  void encodeSymbol(uint sym)
  {
    uint cumFreq;
    uint freq;

    if (sym>127) cumFreq=tree[0];
    else
    {
      cumFreq = 0;
      tree[0]+=INC;
    }
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

    if ((totFreq+=INC)>TOTAL_LIMIT) Rescale();
  }

  uint decodeSymbol()
  {
    uint decFreq;
    uint savedFreq = decFreq = rc.GetFreq(totFreq);

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

    if ((totFreq+=INC)>TOTAL_LIMIT) Rescale();

    return sym;
  }

  ~ORDER_0_CODER() {}

protected:

  void BuildTree()
  {
    memset(tree,0,127*4);

    for (uint i = 1; i<8; i++)
    {
      uint * p = tree+(1<<(7-i))-1;
      uint * p1 = tree+127;

      uint inc = 1<<i;

      for (uint j=0; j<(1<<(7-i)); j++, p++, p1+=inc)
      {
        uint * last = p1+inc;
        for (;p1<last;) *p+=*p1++;
      }
    }
  }

  void Rescale()
  {
    totFreq = 1;

    for (uint i = 127; i<383; i++)
    {
      if (!(tree[i]>>=1)) tree[i]=1;
      totFreq+=tree[i];
    }

    BuildTree();
  }


};

