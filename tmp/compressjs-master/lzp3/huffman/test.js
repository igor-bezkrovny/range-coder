///<reference path="./huffman.ts"/>
///<reference path="./lzw.ts"/>
var s = "2FWs32_1.4_5_4_AAAAAAAAAAAA_0_6_1_1_1_0_0_5C_A_0_S_6_2_3_4_3_4_5_0_1_4_2_6_0_1_oKRoAAAASoAAAAToAAAAUoAAAAVttAAAWwAAAAX2wAAAYDcAAAZDcgAAaAbgAAbAbAAActtAAAdJAAAAehIADYfkAADYg8AAJAh/AABIi4AAHAjQAA/4kQAAJAlSAABImwACSAn2wCAA_6_0_5_K_1_0_0_0_0_0_K_2_BBBBBBBBBBBB_0_6_1_1_1_0_0_4o_A_0_R_6_2_2_6_5_3_1_2_1_2_0_4_oKRoAAAASoAAAAToAAAAUoAAAAV2xIAAW43JAAX/H4AAY8nAAAZkVAAAaSVAAAbAVAAAcSVIAAdwBIAAe2xAAAfJDYAAgBLYAAhttAAAiHAAAAj/4AAAkbAAAAlbAAAAmEgAAknkAAEg_3_0_7_K_1_0_0_0_0_0_K_4_CCCCCCCCCCCC_0_6_1_1_1_0_0_3E_A_0_K_6_0_2_6_4_3_1_7_1_7_0_5_1_3_4_6_2_oKRoAAAASoAAAAToAAAAUoAAAAV2ySAAWbyAAAXbkAAAYEgAAAZBIAAAaAJAAAbFtoAAcAkAAAdEgAAAeHAAAAf/4AAAgAQAAAhSQAAAiwAAAAj2wAAAkDYAAAlDYAAAmJAAAAnBIAAA_5_0_7_K_1_0_0_0_0_0_K_4_DDDDDDDDDDDD_0_6_1_1_1_0_0_7E_A_0_V_6_2_3_4_6_0_0_2_1_6_3_6_5_4_1_2_oKRFAAAASFAAAATFAAAAUFAAAAVFtoAAW2wAAAXJwAAAYBIAAAZAQAAAaSQAAAbbAAAAcbACAAdDaSAAeDaAAkfCSAEggttADYhwAADYi2wEJAjJAEhIkBIHg4lHA///m/8gGAnAkAG2_5_0_7_L_1_0_0_0_0_0_L_0_EEEEEEEEEEEE_0_6_1_1_1_0_0_4U_A_0_a_6_6_4_4_5_1_0_6_1_3_3_6_2_oKRoAAAASoAAAAToAAAAUoAAAAVSTYAAWQDYAAXwGwAAY22AAAZJGAAAaBMAAAbbEgAAcbHgAAdgH4AAekHAAAfUDYAAgQDYAAhSAIAAiGBIAAjGBAAAk2FAAol4FAAom/FAAon4FAAo_2_0_6_K_1_0_0_0_0_0_K_3";
//console.log(s);
var huff = new HuffmanCoder();
//var encodedH = huff.encode(s);
var encodedLZW = LZW.encode(s);
//var encodedLZWH = huff.encode(encodedLZW);
console.log("was: " + (s.length * 8 / 6));
//console.log("only huffman: " + (encodedH.length/6));
console.log("only lzw: " + (encodedLZW.length * 8 / 6));
//console.log("lzw+huffman: " + (encodedLZWH.length/6));
//var t = huff.decode(encodedH);
//console.log(t);
console.log("is decoded string same as original? " + (s == LZW.decode(encodedLZW)));
//# sourceMappingURL=test.js.map