//  these two values are stored together
//  to improve processor cache hits
typedef struct {
	unsigned prefix, offset;
} KeyPrefix;

//  offset/key prefix
//  for qsort to use

KeyPrefix *Keys;
unsigned *Rank;

//  During the first round which qsorts the prefix into
//  order, a groups of equal keys are chained together
//  into work units for the next round, using
//  the first two keys of the group

unsigned WorkChain;

//  set the offset rankings and create
//  new work units for unsorted groups
//  of equal keys

void bwtsetranks (unsigned from, unsigned cnt)
{
	unsigned idx = 0;

	// all members of a group get the same rank

	while( idx < cnt )
		Rank[Keys[from+idx++].offset] = from;

	// is this a sortable group?

	if( cnt < 2 )
		return;    // final ranking was set

	// if so, add this group to work chain for next round
	// by using the first two key prefix from the group.

	Keys[from].prefix = WorkChain;
	Keys[from + 1].prefix = cnt;
	WorkChain = from;
}

//  set the sort key (prefix) from the ranking of the offsets
//  for rounds after the initial one.

void bwtkeygroup (unsigned from, unsigned cnt, unsigned offset)
{
	unsigned off;

	while( cnt-- ) {
		off = Keys[from].offset + offset;
		Keys[from++].prefix = Rank[off];
	}
}

//  the tri-partite qsort partitioning

//  creates two sets of pivot valued
//  elements from [0:leq] and [heq:size]
//  while partitioning a segment of the Keys

void bwtpartition (unsigned start, unsigned size)
{
	KeyPrefix tmp, pvt, *lo;
	unsigned loguy, higuy;
	unsigned leq, heq;

	while( size > 7 ) {
		// find median-of-three element to use as a pivot
		// and swap it to the beginning of the array
		// to begin the leq group of pivot equals.

		// the larger-of-three element goes to higuy
		// the smallest-of-three element goes to middle

		lo = Keys + start;
		higuy = size - 1;
		leq = loguy = 0;

		//  move larger of lo and hi to tmp,hi

		tmp = lo[higuy];

		if( tmp.prefix < lo->prefix )
		lo[higuy] = *lo, *lo = tmp, tmp = lo[higuy];

		//  move larger of tmp,hi and mid to hi

		if( lo[size >> 1].prefix > tmp.prefix )
			lo[higuy] = lo[size >> 1], lo[size >> 1] = tmp;

		//  move larger of mid and lo to pvt,lo
		//  and the smaller into the middle

		pvt = *lo;

		if( pvt.prefix < lo[size >> 1].prefix )
			*lo = lo[size >> 1], lo[size >> 1] = pvt, pvt = *lo;

		//  start the high group of equals
		//  with a pivot valued element, or not

		if( pvt.prefix == lo[higuy].prefix )
			heq = higuy;
		else
			heq = size;

		for( ; ; ) {
			//  both higuy and loguy are already in position
			//  loguy leaves .le. elements beneath it
			//  and swaps equal to pvt elements to leq

			while( ++loguy < higuy )
				if( pvt.prefix < lo[loguy].prefix )
					break;
				else if( pvt.prefix == lo[loguy].prefix )
					if( ++leq < loguy )
						tmp = lo[loguy], lo[loguy] = lo[leq], lo[leq] = tmp;

			//  higuy leaves .ge. elements above it
			//  and swaps equal to pvt elements to heq

			while( --higuy > loguy )
				if( pvt.prefix > lo[higuy].prefix )
					break;
				else if( pvt.prefix == lo[higuy].prefix )
					if( --heq > higuy )
						tmp = lo[higuy], lo[higuy] = lo[heq], lo[heq] = tmp;

			// quit when they finally meet at the empty middle

			if( higuy <= loguy )
				break;

			// element loguy is .gt. element higuy
			// swap them around (the pivot)

			tmp = lo[higuy];
			lo[higuy] = lo[loguy];
			lo[loguy] = tmp;
		}

		// initialize an empty pivot value group

		higuy = loguy;

		//  swap the group of pivot equals into the middle from
		//  the leq and heq sets. Include original pivot in
		//  the leq set.  higuy will be the lowest pivot
		//  element; loguy will be one past the highest.

		//  the heq set might be empty or completely full.

		if( loguy < heq )
			while( heq < size )
				tmp = lo[loguy], lo[loguy++] = lo[heq], lo[heq++] = tmp;
		else
			loguy = size;  // no high elements, they're all pvt valued

		//  the leq set always has the original pivot, but might
		//  also be completely full of pivot valued elements.

		if( higuy > ++leq )
			while( leq )
				tmp = lo[--higuy], lo[higuy] = lo[--leq], lo[leq] = tmp;
		else
			higuy = 0;    // no low elements, they're all pvt valued

		//  The partitioning around pvt is done.
		//  ranges [0:higuy-1] .lt. pivot and [loguy:size-1] .gt. pivot

		//  set the new group rank of the middle range [higuy:loguy-1]
		//  (the .lt. and .gt. ranges get set during their selection sorts)

		bwtsetranks (start + higuy, loguy - higuy);

		//  pick the smaller group to partition first,
		//  then loop with larger group.

		if( higuy < size - loguy ) {
			bwtpartition (start, higuy);
			size -= loguy;
			start += loguy;
		} else {
			bwtpartition (start + loguy, size - loguy);
			size = higuy;
		}
	}

	//  do a selection sort for small sets by
	//  repeately selecting the smallest key to
	//  start, and pulling any group together
	//  for it at leq

	while( size ) {
		for( leq = loguy = 0; ++loguy < size; )
			if( Keys[start].prefix > Keys[start + loguy].prefix )
				tmp = Keys[start], Keys[start] = Keys[start + loguy], Keys[start + loguy] = tmp, leq = 0;
			else if( Keys[start].prefix == Keys[start + loguy].prefix )
				if( ++leq < loguy )
					tmp = Keys[start + leq], Keys[start + leq] = Keys[start + loguy], Keys[start + loguy] = tmp;

		//  now set the rank for the group of size >= 1

		bwtsetranks (start, ++leq);
		start += leq;
		size -= leq;
	}
}

// the main entry point

KeyPrefix* bwtsort (unsigned char *buff, unsigned size)
{
	unsigned start, cnt, chain;
	unsigned offset = 0, off;
	unsigned prefix[1];

	//  the Key and Rank arrays include stopper elements

	Keys = malloc ((size + 1 ) * sizeof(KeyPrefix));
	memset (prefix, 0xff, sizeof(prefix));

	// construct the suffix sorting key for each offset

	for( off = size; off--; ) {
	*prefix >>= 8;
	*prefix |= buff[off] << (sizeof(prefix) * 8 - 8);
		Keys[off].prefix = *prefix;
		Keys[off].offset = off;
	}

	// the ranking of each suffix offset,
	// plus extra ranks for the stopper elements

	Rank = malloc ((size + sizeof(prefix)) * sizeof(unsigned));

	// fill in the extra stopper ranks

	for( off = 0; off < sizeof(prefix); off++ )
		Rank[size + off] = size + off;

	// perform the initial qsort based on the key prefix constructed
	// above.  Inialize the work unit chain terminator.

	WorkChain = size;
	bwtpartition (0, size);

	// the first pass used prefix keys constructed above,
	// subsequent passes use the offset rankings as keys

	offset = sizeof(prefix);

	// continue doubling the key offset until there are no
	// undifferentiated suffix groups created during a run

	while( WorkChain < size ) {
		chain = WorkChain;
		WorkChain = size;

		// consume the work units created last round
		// and preparing new work units for next pass
		// (work is created in bwtsetranks)

		do {
			start = chain;
			chain = Keys[start].prefix;
			cnt = Keys[start + 1].prefix;
			bwtkeygroup (start, cnt, offset);
			bwtpartition (start, cnt);
		} while( chain < size );

		//  each pass doubles the range of suffix considered,
		//  achieving Order(n * log(n)) comparisons

		offset <<= 1;
	}

	//  return the rank of offset zero in the first key

		Keys->prefix = Rank[0];
	free (Rank);
	return Keys;
}

#ifdef SORTSTANDALONE
#include <stdio.h>

int main (int argc, char **argv)
{
	unsigned size, nxt;
	unsigned char *buff;
	KeyPrefix *keys;
	FILE *in;

in = fopen(argv[1], "rb");

	fseek(in, 0, 2);
	size = ftell(in);
	fseek (in, 0, 0);
	buff = malloc (size);

	for( nxt = 0; nxt < size; nxt++ )
		buff[nxt] = getc(in);

	keys = bwtsort (buff, size);

	for( nxt = 0; nxt < size; nxt++ )
		putc(buff[keys[nxt].offset], stdout);
}
#endif


#ifdef HUFFSTANDALONE
#include <stdlib.h>
#include <memory.h>
#include <string.h>
#include <fcntl.h>
#else
#include "xlink.h"
#endif

#ifdef unix
#define __cdecl
#else
#include <io.h>
#endif

//  please address any bugs discovered in this code
//  to the author: karl malbrain, karl_m@acm.org

//  link bit-level I/O

void arc_put1 (unsigned bit);
unsigned arc_get1 ();

//  This code is adapted from Professor Vitter's
//  article, Design and Analysis of Dynamic Huffman Codes,
//  which appeared in JACM October 1987

//  A design trade-off has been made to simplify the
//  code:  a node's block is determined dynamically,
//  and the implicit tree structure is maintained,
//  e.g. explicit node numbers are also implicit.

//  Dynamic huffman table weight ranking
//  is maintained per Professor Vitter's
//  invariant (*) for algorithm FGK:

//  leaves preceed internal nodes of the
//  same weight in a non-decreasing ranking
//  of weights using implicit node numbers:

//  1) leaves slide over internal nodes, internal nodes
//  swap over groups of leaves, leaves are swapped
//  into group leader position, but two internal
//  nodes never change positions relative
//  to one another.

//  2) weights are incremented by 2:
//  leaves always have even weight values;
//  internal nodes always have odd values.

//  3) even node numbers are always right children;
//  odd numbers are left children in the tree.

//  node 2 * HuffSize - 1 is always the tree root;
//  node HuffEsc is the escape node;

//  the tree is initialized by creating an
//  escape node as the root.

//  each new leaf symbol is paired with a new escape
//  node into the previous escape node in the tree,
//  until the last symbol which takes over the
//  tree position of the escape node, and
//  HuffEsc is left at zero.

//  overall table size: 2 * HuffSize

//  huff_init(alphabet_size, potential symbols used)
//  huff_encode(next_symbol)
//  next_symbol = huff_decode()

//  huff_scale(by_bits) -- scale weights and rebalance tree

typedef struct {
	unsigned up,      // next node up the tree
		down,         // pair of down nodes
		symbol,       // node symbol value
		weight;       // node weight
} HTable;

typedef struct {
	unsigned esc,     // the current tree height
		root,         // the root of the tree
		size,         // the alphabet size
*map;         // mapping for symbols to nodes
	HTable table[1];  // the coding table starts here
} HCoder;

//  initialize an adaptive coder
//  for alphabet size, and count
//  of nodes to be used

HCoder *huff_init (unsigned size, unsigned root)
{
	HCoder *huff;

	//  default: all alphabet symbols are used

	if( !root || root > size )
		root = size;

	//  create the initial escape node
	//  at the tree root

	if( root <<= 1 )
		root--;

	huff = malloc (root * sizeof(HTable) + sizeof(HCoder));
	memset (huff->table + 1, 0, root * sizeof(HTable));
	memset (huff, 0, sizeof(HCoder));

	if( huff->size = size )
		#ifdef HUFFSTANDALONE
		huff->map = calloc (size, sizeof(unsigned));
#else
		huff->map = zalloc (size * sizeof(unsigned));
#endif

		huff->esc = huff->root = root;
	return huff;
}

// split escape node to incorporate new symbol

unsigned huff_split (HCoder *huff, unsigned symbol)
{
	unsigned pair, node;

	//  is the tree already full???

	if( pair = huff->esc )
			huff->esc--;
	else
		return 0;

	//  if this is the last symbol, it moves into
	//  the escape node's old position, and
	//  huff->esc is set to zero.

	//  otherwise, the escape node is promoted to
	//  parent a new escape node and the new symbol.

	if( node = huff->esc ) {
			huff->table[pair].down = node;
			huff->table[pair].weight = 1;
			huff->table[node].up = pair;
			huff->esc--;
	} else
		pair = 0, node = 1;

	//  initialize the new symbol node

		huff->table[node].symbol = symbol;
		huff->table[node].weight = 0;
		huff->table[node].down = 0;
		huff->map[symbol] = node;

	//  initialize a new escape node.

		huff->table[huff->esc].weight = 0;
		huff->table[huff->esc].down = 0;
		huff->table[huff->esc].up = pair;
	return node;
}

//  swap leaf to group leader position
//  return symbol's new node

unsigned huff_leader (HCoder *huff, unsigned node)
{
	unsigned weight = huff->table[node].weight;
	unsigned leader = node, prev, symbol;

	while( weight == huff->table[leader + 1].weight )
	leader++;

	if( leader == node )
		return node;

	// swap the leaf nodes

	symbol = huff->table[node].symbol;
	prev = huff->table[leader].symbol;

		huff->table[leader].symbol = symbol;
		huff->table[node].symbol = prev;
		huff->map[symbol] = leader;
		huff->map[prev] = node;
	return leader;
}

//  slide internal node up over all leaves of equal weight;
//  or exchange leaf with next smaller weight internal node

//  return node's new position

unsigned huff_slide (HCoder *huff, unsigned node)
{
	unsigned next = node;
	HTable swap[1];

*swap = huff->table[next++];

	// if we're sliding an internal node, find the
	// highest possible leaf to exchange with

	if( swap->weight & 1 )
		while( swap->weight > huff->table[next + 1].weight )
	next++;

	//  swap the two nodes

		huff->table[node] = huff->table[next];
		huff->table[next] = *swap;

		huff->table[next].up = huff->table[node].up;
		huff->table[node].up = swap->up;

	//  repair the symbol map and tree structure

	if( swap->weight & 1 ) {
			huff->table[swap->down].up = next;
			huff->table[swap->down - 1].up = next;
			huff->map[huff->table[node].symbol] = node;
	} else {
			huff->table[huff->table[node].down - 1].up = node;
			huff->table[huff->table[node].down].up = node;
			huff->map[swap->symbol] = next;
	}

	return next;
}

//  increment symbol weight and re balance the tree.

void huff_increment (HCoder *huff, unsigned node)
{
	unsigned up;

	//  obviate swapping a parent with its child:
	//    increment the leaf and proceed
	//    directly to its parent.

	//  otherwise, promote leaf to group leader position in the tree

	if( huff->table[node].up == node + 1 )
			huff->table[node].weight += 2, node++;
	else
		node = huff_leader (huff, node);

	//  increase the weight of each node and slide
	//  over any smaller weights ahead of it
	//  until reaching the root

	//  internal nodes work upwards from
	//  their initial positions; while
	//  symbol nodes slide over first,
	//  then work up from their final
	//  positions.

	while( huff->table[node].weight += 2, up = huff->table[node].up ) {
		while( huff->table[node].weight > huff->table[node + 1].weight )
		node = huff_slide (huff, node);

		if( huff->table[node].weight & 1 )
			node = up;
		else
			node = huff->table[node].up;
	}
}

//  scale all weights and rebalance the tree

//  zero weight nodes are removed from the tree
//  by sliding them out the left of the rank list

void huff_scale (HCoder *huff, unsigned bits)
{
	unsigned node = huff->esc, weight, prev;

	//  work up the tree from the escape node
	//  scaling weights by the value of bits

	while( ++node <= huff->root ) {
	//  recompute the weight of internal nodes;
	//  slide down and out any unused ones

	if( huff->table[node].weight & 1 ) {
		if( weight = huff->table[huff->table[node].down].weight & ~1 )
			weight += huff->table[huff->table[node].down - 1].weight | 1;

		//  remove zero weight leaves by incrementing HuffEsc
		//  and removing them from the symbol map.  take care

	} else if( !(weight = huff->table[node].weight >> bits & ~1) )
		if( huff->map[huff->table[node].symbol] = 0, huff->esc++ )
				huff->esc++;

	// slide the scaled node back down over any
	// previous nodes with larger weights

		huff->table[node].weight = weight;
	prev = node;

	while( weight < huff->table[--prev].weight )
	huff_slide (huff, prev);
}

	// prepare a new escape node

		huff->table[huff->esc].down = 0;
}

//  send the bits for an escaped symbol

void huff_sendid (HCoder *huff, unsigned symbol)
{
	unsigned empty = 0, max;

	//  count the number of empty symbols
	//  before the symbol in the table

	while( symbol-- )
		if( !huff->map[symbol] )
	empty++;

	//  send LSB of this count first, using
	//  as many bits as are required for
	//  the maximum possible count

	if( max = huff->size - (huff->root - huff->esc) / 2 - 1 )
	do arc_put1 (empty & 1), empty >>= 1;
	while( max >>= 1 );
}

//  encode the next symbol

void huff_encode (HCoder *huff, unsigned symbol)
{
	unsigned emit = 1, bit;
	unsigned up, idx, node;

	if( symbol < huff->size )
	node = huff->map[symbol];
else
	return;

	//  for a new symbol, direct the receiver to the escape node
	//  but refuse input if table is already full.

	if( !(idx = node) )
		if( !(idx = huff->esc) )
			return;

	//  accumulate the code bits by
	//  working up the tree from
	//  the node to the root

	while( up = huff->table[idx].up )
		emit <<= 1, emit |= idx & 1, idx = up;

	//  send the code, root selector bit first

	while( bit = emit & 1, emit >>= 1 )
		arc_put1 (bit);

	//  send identification and incorporate
	//  new symbols into the tree

	if( !node )
		huff_sendid(huff, symbol), node = huff_split(huff, symbol);

	//  adjust and re-balance the tree

	huff_increment (huff, node);
}

//  read the identification bits
//  for an escaped symbol

unsigned huff_readid (HCoder *huff)
{
	unsigned empty = 0, bit = 1, max, symbol;

	//  receive the symbol, LSB first, reading
	//  only the number of bits necessary to
	//  transmit the maximum possible symbol value

	if( max = huff->size - (huff->root - huff->esc) / 2 - 1 )
	do empty |= arc_get1 () ? bit : 0, bit <<= 1;
	while( max >>= 1 );

	//  the count is of unmapped symbols
	//  in the table before the new one

	for( symbol = 0; symbol < huff->size; symbol++ )
	if( !huff->map[symbol] )
	if( !empty-- )
		return symbol;

	//  oops!  our count is too big, either due
	//  to a bit error, or a short node count
	//  given to huff_init.

	return 0;
}

//  decode the next symbol

unsigned huff_decode (HCoder *huff)
{
	unsigned node = huff->root;
	unsigned symbol, down;

	//  work down the tree from the root
	//  until reaching either a leaf
	//  or the escape node.  A one
	//  bit means go left, a zero
	//  means go right.

	while( down = huff->table[node].down )
		if( arc_get1 () )
			node = down - 1;  // the left child preceeds the right child
		else
			node = down;

	//  sent to the escape node???
	//  refuse to add to a full tree

	if( node == huff->esc )
	if( huff->esc )
		symbol = huff_readid (huff), node = huff_split (huff, symbol);
	else
		return 0;
else
	symbol = huff->table[node].symbol;

	//  increment weights and rebalance
	//  the coding tree

	huff_increment (huff, node);
	return symbol;
}

#ifdef HUFFSTANDALONE

#include <stdio.h>

//FILE *In = stdin, *Out = stdout;
FILE *In, *Out;
unsigned char ArcBit = 0;
int ArcChar = 0;

int main (int argc, char **argv)
{
	int mode, size, symbol;
	unsigned mask = ~0;
	HCoder *huff;

	In = stdin;
	Out = stdout;

	if( argc > 1 )
		mode = argv[1][0], argv[1]++;
	else {
		printf ("Usage: %s [cdtls]nn infile outfile\nnn -- alphabet size\ninfile -- source file\noutfile -- output file", argv[0]);
		return 1;
	}

	if( argv[1][0] == 's' )
		argv[1]++, mask = 8191;

	if( argc > 3 )
		if( !(Out = fopen (argv[3], "w")) )
			return 1;

#ifndef unix
	_setmode (_fileno (Out), _O_BINARY);
#endif

	//  literal text

	if( mode == 'l' ) {
		if( !(size = atoi (argv[1])) )
			size = 256;

		huff = huff_init (256, size);
		putc (size >> 8, Out);
		putc (size, Out);

		size = strlen (argv[2]);
		putc (size >> 16, Out);
		putc (size >> 8, Out);
		putc (size, Out);

		while( symbol = *argv[2]++ )
		huff_encode(huff, symbol);

		while( ArcBit )  // flush last few bits
			arc_put1 (0);

		return 0;
	}

	//  alphabet fill

	if( mode == 't' ) {
		if( !(size = atoi (argv[1])) )
			size = 256;

		huff = huff_init (256, size);
		putc (size >> 8, Out);
		putc (size, Out);

		putc (size >> 16, Out);
		putc (size >> 8, Out);
		putc (size, Out);

		for( symbol = 0; symbol < size; symbol++ )
			huff_encode(huff, symbol);

		while( ArcBit )  // flush last few bits
			arc_put1 (0);

		return 0;
	}

	if( argc > 2 )
		if( !(In = fopen (argv[2], "r")) )
			return 1;

#ifndef unix
	_setmode (_fileno (In), _O_BINARY);
#endif

	//  decompression

	if( mode == 'd' ) {
		size = getc(In) << 8;
		size |= getc(In);

		huff = huff_init (256, size);

		size = getc(In) << 16;
		size |= getc(In) << 8;
		size |= getc(In);

		while( size )
			if( symbol = huff_decode(huff), putc (symbol, Out), size-- & mask )
				continue;
			else
				huff_scale(huff, 1);

		return 0;
	}

	// compression

	if( !(size = atoi (argv[1])) )
		size = 256;

	huff = huff_init (256, size);
	putc (size >> 8, Out);
	putc (size, Out);

	fseek(In, 0, 2);
	size = ftell(In);
	fseek (In, 0, 0);

	putc (size >> 16, Out);
	putc (size >> 8, Out);
	putc (size, Out);

	while( size )
		if( symbol = getc(In), huff_encode(huff, symbol), size-- & mask )
			continue;
		else
			huff_scale(huff, 1);

	while( ArcBit )  // flush last few bits
		arc_put1 (0);

	return 0;
}

void arc_put1 (unsigned bit)
{
	ArcChar <<= 1;

	if( bit )
		ArcChar |= 1;

	if( ++ArcBit < 8 )
		return;

	putc (ArcChar, Out);
	ArcChar = ArcBit = 0;
}

unsigned arc_get1 ()
{
	if( !ArcBit )
		ArcChar = getc (In), ArcBit = 8;

	return ArcChar >> --ArcBit & 1;
}
#endif



// Burrows Wheeler Transform Encoder/Decoder

#ifdef LINKED
#include "xlink.h"
extern void __cdecl qsort ( void *base, unsigned num, unsigned width, int (__cdecl *comp)(const void *, const void *));
#else
#include <stdlib.h>
#include <fcntl.h>
#endif

#include <memory.h>
#include <string.h>

#ifdef unix
#define __cdecl
#else
#include <io.h>
#endif

//  these two values are stored together
//  to improve processor cache hits

typedef struct {
	unsigned prefix, offset;
} KeyPrefix;

//  link to suffix sort module

extern KeyPrefix *bwtsort(unsigned char *, unsigned);

//  these functions link bit-level I/O

void arc_put1 (int bit);
void arc_put8 (int byte);
int arc_get1 ();
int arc_get8 ();

//  define 1/2 rle zero alphabet bits

#define HUFF_bit0 256
#define HUFF_bit1 257

//  the size of the canonical Huffman alphabet

#define HUFF_size 258

//  store these values together for bwt decoding

typedef struct {
	unsigned code:8;
	unsigned cnt:24;
} Xform;

//  the canonical HuffMan table for each alphabet character

typedef struct {
	unsigned len;
	unsigned code;
} HuffTable;

HuffTable HuffCode[HUFF_size];

//  used to construct the canonical HuffCode table

struct Node {
	struct Node *left, *right;
	unsigned freq;
};

unsigned Freq[HUFF_size], ZeroCnt;  // alphabet counts
unsigned char MtfOrder[256];        // move-to-front

//    enumerate canonical coding tree depths

unsigned enumerate (unsigned *codes, struct Node *node, unsigned depth)
{
	unsigned one, two;

	if( !node->right ) {    // leaf node?
	HuffCode[(int)(node->left)].len = depth;
	codes[depth]++;
	return depth;
}

	one = enumerate (codes, node->left, depth + 1);
	two = enumerate (codes, node->right, depth + 1);

	// return the max depth of the two sub-trees

	return one > two ? one : two;
}

int __cdecl comp_node (const void *left, const void *right)
{
	return ((struct Node *)left)->freq - ((struct Node *)right)->freq;
}

// construct canonical Huffman coding tree lengths

void huff_init ()
{
	struct Node tree[2 * HUFF_size], *base = tree, *left, *right;
	unsigned codes[32], rank[32], weight, mask, count;
	int idx, max;
	int size;

	// the node tree is built with all the base symbols
	// then interiour nodes are appended

	memset (HuffCode, 0, sizeof(HuffCode));
	memset (tree, 0, sizeof(tree));

	// sort base symbol nodes by their frequencies

	for( size = 0; size < HUFF_size; size++ ) {
		tree[size].left = (void *)size;
		tree[size].freq = Freq[size];
		tree[size].right = NULL;    // indicates a base node
	}

	qsort (tree, HUFF_size, sizeof(struct Node), comp_node);

	// repeatedly combine & remove two lowest freq nodes,
	// construct an interiour node w/sum of these two freq
	// and insert onto the end of the tree (base + size)

	while( size-- > 1 ) {
		left = base;

		if( weight = (base++)->freq )
		weight += base->freq;
	else
		continue;    // skip zero freq alphabet chars

		right = base++;
		idx = size;

		// sort new interiour node into place

		while( --idx )
			if( base[idx-1].freq > weight )
				base[idx] = base[idx-1];
			else
				break;

		// construct the new interiour node

		base[idx].freq = weight;
		base[idx].right = right;
		base[idx].left = left;
	}

	// base now points at root of tree (size == 1)
	// construct the canonical Huffman code lengths
	// down from here

	memset (codes, 0, sizeof(codes));
	memset (rank, 0, sizeof(rank));

	// enumerate the left & right subtrees,
	// returns the deepest path to leaves

	max = enumerate (rank, base, 0);

	// use canonical Huffman coding technique

	for( idx = 0; idx <= max; idx++ )
		codes[idx + 1] = (codes[idx] + rank[idx]) << 1, rank[idx] = 0;

	// set the code for each non-zero freq alphabet symbol

	for( idx = 0; idx < HUFF_size; idx++ ) {
		if( count = HuffCode[idx].len )
			HuffCode[idx].code = codes[HuffCode[idx].len] + rank[HuffCode[idx].len]++;
		// transmit canonical huffman coding tree by
		// sending 5 bits for each symbol's length

		mask = 1 << 5;

		while( mask >>= 1 )
			arc_put1 (count & mask);
	}
}

//    output code bits for one alphabet symbol

unsigned huff_encode (unsigned val)
{
	unsigned mask = 1 << HuffCode[val].len;
	unsigned code = HuffCode[val].code;

	while( mask >>= 1 )
		arc_put1 (code & mask);

	return code;
}

//  perform run-length-encoding
//  using two new Huffman codes
//  for RLE count bits 0 & 1

// repeated zeroes are first counted,
// this count is transmitted in binary
// using 2 special HUFF alphabet symbols
// HUFF_bit0 and HUFF_bit1, representing
// count values 1 & 2:

// transmit HUFF_bit0 = count of 1
// transmit HUFF_bit1 = count of 2
// transmit HUFF_bit0, HUFF_bit0 = count of 3
// transmit HUFF_bit0, HUFF_bit1 = count of 4
// transmit HUFF_bit1, HUFF_bit0 = count of 5
// transmit HUFF_bit1, HUFF_bit1 = count of 6 ...

// to make decoding simpler, transmit any final
// zero code separately from its RLE count

void rle_encode (unsigned code, int flush)
{
	if( !code && !flush ) {
		ZeroCnt++;         // accumulate RLE count
		return;            // except for trailing code
	}

	while( ZeroCnt )  // transmit any RLE count bits
		huff_encode (HUFF_bit0 + (--ZeroCnt & 0x1)), ZeroCnt >>= 1;

	huff_encode (code);
}

//    Move-to-Front decoder

unsigned mtf_decode (unsigned nxt)
{
	unsigned char code;

//  Pull the char

	code = MtfOrder[nxt];

//  Now shuffle the order array

	revcpy (MtfOrder + 1, MtfOrder, nxt);
	return MtfOrder[0] = code;
}

// expand BWT into the supplied buffer

void rle_decode (Xform *xform, unsigned size, unsigned last)
{
	unsigned xlate[HUFF_size], length[HUFF_size];
	unsigned codes[32], rank[32], base[32], bits;
	unsigned nxt, count, lvl, idx, out = 0, zero;
	unsigned char prev;

	// construct decode table

	memset (codes, 0, sizeof(codes));
	memset (rank, 0, sizeof(rank));

	// retrieve code lengths, 5 bits each

	for( idx = 0; idx < HUFF_size; idx++ ) {
		for( length[idx] = bits = 0; bits < 5; bits++ )
			length[idx] <<= 1, length[idx] |= arc_get1();
		rank[length[idx]]++;
	}

	// construct canonical Huffman code groups
	// one group range for each bit length

	base[0] = base[1] = 0;

	for( idx = 1; idx < 30; idx++ ) {
		codes[idx + 1] = (codes[idx] + rank[idx]) << 1;
		base[idx + 1] = base[idx] + rank[idx];
		rank[idx] = 0;
	}

	// fill in the translated canonical Huffman codes
	// by filling in ranks for each code group

	for( nxt = idx = 0; idx < HUFF_size; idx++ )
		if( lvl = length[idx] )
			xlate[base[lvl] + rank[lvl]++] = idx;

	zero = prev = count = bits = lvl = 0;

	// fill supplied buffer by reading the input
	// one bit at a time and assembling codes

	while( ++lvl < 32 && out < size ) {
		bits <<= 1, bits |= arc_get1 ();

		if( rank[lvl] )
			if( bits < codes[lvl] + rank[lvl] )
				nxt = xlate[base[lvl] + bits - codes[lvl]];
			else
				continue;  // the code is above the range for this length
		else
			continue;    // no symbols with this code length, get next bit

		// nxt is the recognized symbol
		// reset code accumulator

		bits = lvl = 0;

		// process RLE count code as a 1 or 2

		if( nxt > 255 ) {
			count += ( nxt - 255 ) << zero++;
			continue;
		}

		// expand any previously decoded RLE count

		while( count ) {
			if( out == last )       // not needed since we never look at it
				xform[out].cnt = 0; // but the EOB must not be counted
			else
				xform[out].cnt = Freq[prev]++;

			xform[out++].code = prev;
			count--;
		}

		zero = 0;
		prev = mtf_decode (nxt);  // translate mtf of the symbol

		if( out == last )         // not needed since we never look at it
			xform[out].cnt = 0;   // but the EOB must not be counted
		else
			xform[out].cnt = Freq[prev]++;

		xform[out++].code = prev;  // store next symbol
	}
}

//    Move-to-Front encoder, and
//    accumulate frequency counts
//    using RLE coding (not for flush)

unsigned char mtf_encode (unsigned char val, int flush)
{
	unsigned code;

	code = (unsigned char *)memchr (MtfOrder, val, 256) - MtfOrder;
	revcpy (MtfOrder + 1, MtfOrder, code);
	MtfOrder[0] = val;

	if( !flush && !code )
		return ZeroCnt++, code;

	//  accumulate the frequency counts for the
	//  new code and the previous zero run

	Freq[code]++;

	while( ZeroCnt )
		Freq[HUFF_bit0 + (--ZeroCnt & 0x1)]++, ZeroCnt >>= 1;

	return code;
}

//    initialize Move-to-Front symbols

void mtf_init ()
{
	unsigned idx;

	for( idx = 0 ; idx < 256 ; idx++ )
		MtfOrder[idx] = (unsigned char)idx;
}

// unpack next bwt segment from current stream into buffer

void bwt_decode (unsigned char *outbuff, unsigned buflen)
{
	unsigned last, idx = 0;
	Xform *xform;
	unsigned ch;

	mtf_init ();
	xform = malloc ((buflen + 1 ) * sizeof(Xform));

	// retrieve last row number

	last = arc_get8 () << 16;
	last |= arc_get8 () << 8;
	last |= arc_get8 ();

// To determine a character's position in the output string given
// its position in the input string, we can use the knowledge about
// the fact that the output string is sorted.  Each character 'c' will
// show up in the output stream in in position i, where i is the sum
// total of all characters in the input buffer that precede c in the
// alphabet (kept in the count array), plus the count of all
// occurences of 'c' previously in the block (kept in xform.cnt)

// The first part of this code calculates the running totals for all
// the characters in the alphabet.  That satisfies the first part of the
// equation needed to determine where each 'c' will go in the output
// stream. Remember that the character pointed to by 'last' is a special
// end-of-buffer character that needs to be larger than any other char
// so we just skip over it while tallying counts

	memset (Freq, 0, sizeof(Freq));
	rle_decode (xform, buflen + 1, last);

	for( idx = 1 ; idx < 256 ; idx++ )
		Freq[idx] += Freq[idx-1];

// Once the transformation vector is in place, writing the
// output is just a matter of computing the indices.  Note
// that we ignore the EOB from the end of data first, and
// process the array backwards from there

	last = idx = buflen;

	while( idx-- ) {
		ch = outbuff[idx] = xform[last].code;
		last = xform[last].cnt;

		if( ch-- )
			last += Freq[ch];
	}

	free (xform);
}

// pack next bwt segment into current stream

void bwt_encode (unsigned char *buff, unsigned max)
{
	unsigned idx, off;
	KeyPrefix *keys;

	// zero freq counts

	mtf_init ();

	memset (Freq, 0, sizeof(Freq));
	ZeroCnt = 0;

	keys = bwtsort (buff, max);

	// transmit where the EOB is located

	arc_put8 ((unsigned char)(keys->prefix >> 16));
	arc_put8 ((unsigned char)(keys->prefix >> 8));
	arc_put8 ((unsigned char)(keys->prefix));

	//  Write out column L.  Column L consists of all
	// the prefix characters to the sorted strings, in order.
	// It's easy to get the prefix character, but offset 0
	// is handled with care, since its prefix character
	// is the imaginary end-of-buffer character.

	for( idx = 0; idx < max; idx++ )
		if( off = keys[idx].offset )
			keys[idx].offset = mtf_encode (buff[--off], 0);
		else
			keys[idx].offset = mtf_encode (MtfOrder[0], 0);

	keys[idx].offset = mtf_encode (buff[max - 1], 1);

	// construct huff coding tree and transmit code-lengths

	huff_init ();

	// encode and transmit output

	for( idx = 0; idx < max; idx++ )
		rle_encode (keys[idx].offset, 0);

	rle_encode (keys[max].offset, 1);
	free (keys);
}

#ifdef CODERSTANDALONE

#include <stdio.h>

unsigned char ArcBit = 0, ArcChar = 0;
FILE *In = stdin, *Out = stdout;

int main (int argc, char **argv)
{
	int mode, max, size, nxt;
	unsigned char *buff;

	if( argc > 1 )
		mode = argv[1][0];
	else {
		printf ("Usage: %s [cd] infile outfile\nnn -- alphabet size\ninfile -- source file\noutfile -- output file", argv[0]);
		return 1;
	}

	if( argc > 3 )
		if( !(Out = fopen (argv[3], "w")) )
			return 1;

#ifndef unix
	_setmode (_fileno (Out), _O_BINARY);
#endif

	//  literal text

	if( mode == 'l' ) {
		max = strlen (argv[2]);
		putc ((unsigned char)(max >> 16), Out);
		putc ((unsigned char)(max >> 8), Out);
		putc ((unsigned char)(max), Out);

		if( max )
			bwt_encode ((unsigned char *)argv[2], max);

		while( ArcBit )  // flush last few bits
			arc_put1 (0);

		return 0;
	}

	if( argc > 2 )
		if( !(In = fopen (argv[2], "r")) )
			return 1;

#ifndef unix
	_setmode (_fileno (In), _O_BINARY);
#endif

	//  decompression

	while( mode == 'd' ) {
		size = getc (In);

		if( size < 0 )
			return 0;

		for( nxt = 0; nxt < 2; nxt++ )
			size <<= 8, size |= getc (In);

		ArcBit = 0;

		if( size ) {
			buff = malloc (size);
			bwt_decode (buff, size);
		}

		for( nxt = 0; nxt < size; nxt++ )
			putc (buff[nxt], Out);

		if( size )
			free (buff);
	}

	// compression

	fseek(In, 0, 2);
	size = ftell(In);
	fseek (In, 0, 0);

	do {
		if( max = size > 900000 ? 900000 : size )
			buff = malloc (max + 128);

		putc ((unsigned char)(max >> 16), Out);
		putc ((unsigned char)(max >> 8), Out);
		putc ((unsigned char)(max), Out);

		for( nxt = 0; nxt < max; nxt++ )
			buff[nxt] = getc(In);

		if( max )
			bwt_encode (buff, max), free (buff);

		while( ArcBit )  // flush last few bits
			arc_put1 (0);

	} while( size -= max );

	return 0;
}

void arc_put1 (int bit)
{
	ArcChar <<= 1;

	if( bit )
		ArcChar |= 1;

	if( ++ArcBit < 8 )
		return;

	putc (ArcChar, Out);
	ArcChar = ArcBit = 0;
}

void arc_put8 (int ch)
{
	int idx = 8;

	while( idx-- )
		arc_put1 (ch & 1 << idx);
}

int arc_get1 ()
{
	if( !ArcBit )
		ArcChar = getc (In), ArcBit = 8;

	return ArcChar >> --ArcBit & 1;
}

int arc_get8 ()
{
	int idx, result = 0;

	for( idx = 0; idx < 8; idx++ )
		result <<= 1, result |= arc_get1();

	return result;
}
#endif
