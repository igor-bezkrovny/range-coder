///<reference path="./binaryHeap.ts"/>

/**
 * Binary Tree: public licence http://eloquentjavascript.net/1st_edition/appendix2.html
 * Huffman: http://rosettacode.org/wiki/Huffman_coding#JavaScript
 */
class HuffmanCoder {
	private _encoding : any;

	public encode(str : string) : string {
		var count_chars = {};
		for (var i = 0; i < str.length; i++)
			if (str[ i ] in count_chars)
				count_chars[ str[ i ] ]++;
			else
				count_chars[ str[ i ] ] = 1;

		var pq = new BinaryHeap(function (x) {
			return x[ 0 ];
		});
		for (var ch in count_chars)
			pq.push([ count_chars[ ch ], ch ]);

		while (pq.size() > 1) {
			var pair1 = pq.pop();
			var pair2 = pq.pop();
			pq.push([ pair1[ 0 ] + pair2[ 0 ], [ pair1[ 1 ], pair2[ 1 ] ] ]);
		}

		var tree = pq.pop(),
			encoding = {};
		this._generate_encoding(encoding, tree[ 1 ], "");

		var encoded_string : string = "";
		for (var i = 0; i < str.length; i++) {
			encoded_string += encoding[ str[ i ] ];
		}

		return encoded_string;
	}

	private _generate_encoding(encoding, ary, prefix) : void {
		if (ary instanceof Array) {
			this._generate_encoding(encoding, ary[ 0 ], prefix + "0");
			this._generate_encoding(encoding, ary[ 1 ], prefix + "1");
		} else {
			encoding[ ary ] = prefix;
		}
	}

	public decode(encoded : string) : string {
		var rev_enc = {};
		for (var ch in this._encoding)
			rev_enc[ this._encoding[ ch ] ] = ch;

		var decoded = "";
		var pos = 0;
		while (pos < encoded.length) {
			var key = "";
			while (!(key in rev_enc)) {
				key += encoded[ pos ];
				pos++;
			}
			decoded += rev_enc[ key ];
		}
		return decoded;
	}
}
