function calculate_entropy(data, data_size) {
    var min, max, counter, buffer_size;
    var buffer;
    var entropy, log2 = Math.log(2.0), prob;
    min = data[0];
    max = data[0];
    for (counter = 0; counter < data_size; ++counter) {
        if (data[counter] < min)
            min = data[counter];
        if (data[counter] > max)
            max = data[counter];
    }
    buffer_size = max - min + 1;
    buffer = new Array(buffer_size);
    for (var i = 0; i < buffer_size; i++)
        buffer[i] = 0;
    for (counter = 0; counter < data_size; ++counter) {
        buffer[data[counter] - min]++;
    }
    entropy = 0;
    for (counter = 0; counter < buffer_size; counter++) {
        if (buffer[counter] > 0) {
            prob = buffer[counter];
            prob /= data_size;
            entropy += Math.log(prob) / log2 * prob;
        }
    }
    return entropy * -1;
}
function makeData(data, data_size, min, max, redundancy_factor) {
    var counter, cnt, high, low, buf;
    if (redundancy_factor <= 1)
        redundancy_factor = 1;
    if (max <= min)
        max = min + 1;
    for (counter = 0; counter < data_size; counter++) {
        buf = 0;
        for (cnt = 0; cnt < redundancy_factor; cnt++) {
            buf += (Math.random() * 32767) | 0;
        }
    }
    low = data[0];
    high = data[0];
    for (counter = 0; counter < data_size; counter++) {
        if (data[counter] > high)
            high = data[counter];
        if (data[counter] < low)
            low = data[counter];
    }
    for (counter = 0; counter < data_size; counter++) {
        buf = data[counter] - low;
        buf /= high - low;
        buf *= max - min;
        buf = Math.round(buf);
        data[counter] = (buf | 0) + min;
    }
    return calculate_entropy(data, data_size);
}
//end of data generation functions
//global data buffer for round trip
var g_buffer = [];
var current_byte = 0;
//input/output functions
function writeByte(byte) {
    g_buffer[current_byte++] = byte;
}
function readByte() {
    return g_buffer[current_byte++];
}
function findInterval(cm, size, point) {
    var index = -1, left = 0, right = size - 2, cnt = 0;
    while (true) {
        var mid = (right + left) >>> 1;
        if (point >= cm[mid] && point < cm[mid + 1]) {
            index = mid;
            break;
        }
        if (point >= cm[mid + 1])
            left = mid + 1;
        else
            right = mid;
        if (cnt++ >= size)
            break;
    }
    return index;
}
//This is the main class RangeMapper. It can be used in adaptive data
//processing. It processes ranges that passed to encoder and decoder.
//In adaptive coder the ranges can be computed dynamically and depend
//on the context. 
//Class is written for generic case: alphabets from 2 up to 10000 can be
//processed without changes in code. In case of special data coder can
//be optimized and run at least twice faster. 
var RangeMapper = (function () {
    function RangeMapper(range_size) {
        this.LOW = 0;
        this.MID = 0;
        this.RANGE_SIZE = range_size;
        this.RANGE_LIMIT = 1 << this.RANGE_SIZE;
        this.BYTES_IN_BUFFER = (64 - this.RANGE_SIZE) >>> 3;
        this.SHIFT = (this.BYTES_IN_BUFFER - 1) * 8;
        this.MASK = (1 << (this.BYTES_IN_BUFFER * 8)) - 1;
        this.HIGH = this.MASK;
    }
    RangeMapper.prototype.encodeRange = function (cmin, cmax) {
        console.log("enc: cmin = " + cmin + ", cmax = " + cmax);
        this.updateModel(cmin, cmax);
        if ((this.HIGH - this.LOW) < this.RANGE_LIMIT)
            this.HIGH = this.LOW; //preventing narrowing range
        while (((this.LOW ^ this.HIGH) >>> this.SHIFT) == 0) {
            console.log("writeByte: " + ((this.LOW >>> this.SHIFT) | 0));
            writeByte(((this.LOW >>> this.SHIFT) | 0) & 0xff);
            this.LOW <<= 8;
            this.HIGH = (this.HIGH << 8) | 0xff;
        }
        this.HIGH &= this.MASK;
        this.LOW &= this.MASK;
    };
    RangeMapper.prototype.decodeRange = function (cmin, cmax) {
        console.log("dec: cmin = " + cmin + ", cmax = " + cmax);
        this.updateModel(cmin, cmax);
        if ((this.HIGH - this.LOW) < this.RANGE_LIMIT)
            this.HIGH = this.LOW;
        while (((this.LOW ^ this.HIGH) >>> this.SHIFT) == 0) {
            this.LOW <<= 8;
            this.HIGH = (this.HIGH << 8) | 0xff;
            this.MID = (this.MID << 8) | readByte();
            console.log("readByte: " + (this.MID & 0xFF));
        }
        this.HIGH &= this.MASK;
        this.LOW &= this.MASK;
        this.MID &= this.MASK;
    };
    RangeMapper.prototype.getMidPoint = function () {
        return ((this.MID - this.LOW << this.RANGE_SIZE) / (this.HIGH - this.LOW)) | 0;
    };
    RangeMapper.prototype.flush = function () {
        this.LOW += 1;
        for (var i = 0; i < this.BYTES_IN_BUFFER; i++) {
            writeByte((this.LOW >>> this.SHIFT) | 0);
            this.LOW <<= 8;
        }
    };
    RangeMapper.prototype.init = function () {
        for (var i = 0; i < this.BYTES_IN_BUFFER; i++) {
            this.MID = (this.MID << 8) + readByte();
        }
    };
    RangeMapper.prototype.updateModel = function (cmin, cmax) {
        var range = this.HIGH - this.LOW;
        this.HIGH = this.LOW + ((range * cmax) >>> this.RANGE_SIZE);
        this.LOW += ((range * cmin) >>> this.RANGE_SIZE) + 1;
    };
    return RangeMapper;
})();
function makeRanges(data, data_size, cm, alphabet_size, PRECISION) {
    //we make ranges for data
    var freq = new Array(alphabet_size);
    for (var i = 0; i < alphabet_size; i++)
        freq[i] = 0;
    for (i = 0; i < data_size; ++i) {
        freq[data[i]]++;
    }
    cm[0] = 0;
    for (i = 0; i < alphabet_size; ++i) {
        cm[i + 1] = cm[i] + freq[i];
    }
    var total = cm[alphabet_size];
    var upper_limit = (1 << PRECISION) - 2;
    for (var i = 0; i < alphabet_size + 1; ++i) {
        cm[i] = (cm[i] * upper_limit / total) | 0;
    }
    cm[alphabet_size + 1] = (1 << PRECISION) - 1;
    for (i = 0; i < alphabet_size; ++i) {
        if (cm[i + 1] <= cm[i])
            cm[i + 1] = cm[i] + 1;
    }
    for (i = alphabet_size; i >= 0; --i) {
        if (cm[i] >= cm[i + 1])
            cm[i] = cm[i + 1] - 1;
    }
    //end of correction
}
function makeLookupTable(cm, size, lookup) {
    for (var i = 0; i < size - 1; i++) {
        for (var j = cm[i]; j < cm[i + 1]; j++) {
            lookup[j] = i;
        }
    }
}
function main() {
    //parameters that can be changed for testing
    //the RANGE_SIZE_IN_BITS depends on your alphabet size
    var alphabet_size = 256; //Please notice the size of the alphabet.
    var data_size = 1;
    var RANGE_SIZE_IN_BITS = 4; //14
    ////////////////////////////////
    //we make original data
    console.log("Wait, the data is being made ...");
    var data = [1];
    new Array(data_size);
    var entropy = makeData(data, data_size, 0, alphabet_size - 1, 0);
    var expected_size = (entropy * (data_size) / 8.0) | 0;
    //data is made
    //make ranges for data
    var cm_size = alphabet_size + 2;
    var cm = new Array(cm_size);
    makeRanges(data, data_size, cm, alphabet_size, RANGE_SIZE_IN_BITS);
    //ranges are completed
    //encode
    g_buffer = new Array(expected_size * 2);
    var start_encoding = Date.now();
    var rm_encode = new RangeMapper(RANGE_SIZE_IN_BITS);
    for (var i = 0; i < data_size; i++) {
        rm_encode.encodeRange(cm[data[i]], cm[data[i] + 1]);
    }
    rm_encode.encodeRange(cm[alphabet_size], cm[alphabet_size + 1]); //end of data marker
    rm_encode.flush();
    var end_encoding = Date.now();
    console.log("Time for encoding %2.3f sec.", (end_encoding - start_encoding) / 1000);
    var actual_size = current_byte;
    //end encoding
    //decode
    var start_decoding = Date.now();
    var lookup = new Array((1 << RANGE_SIZE_IN_BITS) + 1);
    makeLookupTable(cm, alphabet_size + 2, lookup);
    var isOK = true;
    var rm_decode = new RangeMapper(RANGE_SIZE_IN_BITS);
    current_byte = 0;
    rm_decode.init();
    i = 0;
    while (true) {
        var midpoint = rm_decode.getMidPoint();
        //next is binary search algorithm that does not need having lookup array
        //int index = findInterval(cm, alphabet_size + 2, midpoint);
        //this is lookup table that expedites execution, either of these functions works
        var index = lookup[midpoint]; //midpoint presumed being within correct boundaries
        if (index == alphabet_size)
            break; //end of data marker
        if (index != data[i++]) {
            console.log("Data mismatch %d element %d\n", i, index);
            isOK = false;
            break;
        }
        rm_decode.decodeRange(cm[index], cm[index + 1]);
    }
    if (i != data_size)
        isOK = false;
    var end_decoding = Date.now();
    console.log("Time for decoding %2.3f sec.", (end_decoding - start_decoding) / 1000);
    //end decoding
    console.log("Expected size %d", expected_size);
    console.log("Actual size   %d, ", actual_size);
    if (isOK)
        console.log("Round trip is OK\n");
    else
        console.log("Data mismatch\n");
    return 0;
}
function main2() {
    var lzw = new LZW();
    var text1 = "2FWs32_1.4_5_4_AAAAAAAAAAAA_0_6_1_1_1_0_0_5C_A_0_S_6_2_3_4_3_4_5_0_1_4_2_6_0_1_oKRoAAAASoAAAAToAAAAUoAAAAVttAAAWwAAAAX2wAAAYDcAAAZDcgAAaAbgAAbAbAAActtAAAdJAAAAehIADYfkAADYg8AAJAh/AABIi4AAHAjQAA/4kQAAJAlSAABImwACSAn2wCAA_6_0_5_K_1_0_0_0_0_0_K_2_BBBBBBBBBBBB_0_6_1_1_1_0_0_4o_A_0_R_6_2_2_6_5_3_1_2_1_2_0_4_oKRoAAAASoAAAAToAAAAUoAAAAV2xIAAW43JAAX/H4AAY8nAAAZkVAAAaSVAAAbAVAAAcSVIAAdwBIAAe2xAAAfJDYAAgBLYAAhttAAAiHAAAAj/4AAAkbAAAAlbAAAAmEgAAknkAAEg_3_0_7_K_1_0_0_0_0_0_K_4_CCCCCCCCCCCC_0_6_1_1_1_0_0_3E_A_0_K_6_0_2_6_4_3_1_7_1_7_0_5_1_3_4_6_2_oKRoAAAASoAAAAToAAAAUoAAAAV2ySAAWbyAAAXbkAAAYEgAAAZBIAAAaAJAAAbFtoAAcAkAAAdEgAAAeHAAAAf/4AAAgAQAAAhSQAAAiwAAAAj2wAAAkDYAAAlDYAAAmJAAAAnBIAAA_5_0_7_K_1_0_0_0_0_0_K_4_DDDDDDDDDDDD_0_6_1_1_1_0_0_7E_A_0_V_6_2_3_4_6_0_0_2_1_6_3_6_5_4_1_2_oKRFAAAASFAAAATFAAAAUFAAAAVFtoAAW2wAAAXJwAAAYBIAAAZAQAAAaSQAAAbbAAAAcbACAAdDaSAAeDaAAkfCSAEggttADYhwAADYi2wEJAjJAEhIkBIHg4lHA///m/8gGAnAkAG2_5_0_7_L_1_0_0_0_0_0_L_0_EEEEEEEEEEEE_0_6_1_1_1_0_0_4U_A_0_a_6_6_4_4_5_1_0_6_1_3_3_6_2_oKRoAAAASoAAAAToAAAAUoAAAAVSTYAAWQDYAAXwGwAAY22AAAZJGAAAaBMAAAbbEgAAcbHgAAdgH4AAekHAAAfUDYAAgQDYAAhSAIAAiGBIAAjGBAAAk2FAAol4FAAom/FAAon4FAAo_2_0_6_K_1_0_0_0_0_0_K_3";
    var encoded = lzw.encode(text1);
    var decoded = lzw.decode(encoded);
    console.log("was: " + (text1.length * 8 / 6) + ", compressed = " + (encoded.length * 8 / 6));
    console.log(encoded);
    console.log(decoded);
}
var LZW = function () {
};
LZW.prototype.encode = function (s) {
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i = 1; i < data.length; i++) {
        currChar = data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        }
        else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase = currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i = 0; i < out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
};
LZW.prototype.decode = function (s) {
    var dict = {};
    var data = (s + "").split("");
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 256;
    var phrase;
    for (var i = 1; i < data.length; i++) {
        var currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        }
        else {
            phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    return out.join("");
};
main();
//# sourceMappingURL=rangeCoder.js.map