var lzp3 = compressJS.Lzp3;
var range = compressJS.RangeCoderCompressor;

var testRoundTrip = function (cmp, referenceData) {
	var referenceDataArray = referenceData.split("").map(function(ch) { return ch.charCodeAt(0);});

	log("original size: " + referenceDataArray.length);
	var startTime = getTime();
	var data = cmp.compressFile(referenceDataArray, null, null);
	log("compress time: " + (getTime() - startTime) + ", size: " + data.length);
	// convert to buffer
	//data = new Buffer(data);
	// round trip
	startTime = getTime();
	var data2 = cmp.decompressFile(data);
	log("decompress time: " + (getTime() - startTime));
	// convert to buffer
	//data2 = new Buffer(data2);
	data2 = Array.prototype.slice.call(data2);
	data2 = data2.map(function(charCode) {return String.fromCharCode(charCode);});
	if(referenceData === data2.join("")) {
		log("good");
	} else {
		log("bad");
	}
};

// test round-trip encode/decode for all compression variants
testRoundTrip(lzp3, '1.29_2_0_2_A_KjUDtLQ_6_0 1 70000 0 0MMMMMMMMMMM_H5m_13 3 71000 1 WWWWWWWWWWW1_5np_2 3 70000 2 2MMMMMMMMMMM_5ic_3 4 70000 3 3MMMMMMMMMMM_4HS_4 5 70000 3 4MMMMMMMMMMM_3Qm_0 1 1000 4 A00000000000_Fe_1_0_5_KjUDtLQ_5_0 1 700000 0 0AAAAAAAAAAA_2gvW_1 2 700000 1 1AAAAAAAAAAA_1LSm_2 3 700000 2 2AAAAAAAAAAA_uzs_3 4 700000 3 3AAAAAAAAAAA_gkO_4 5 700000 3 4AAAAAAAAAAA_YBW_4_5_KjUDtLR_0_WWWWWWWWWWW0_9_0_1_1_1_2_3_A_K_1_3_1_xenBotNames.RICARDO_O_XenEasyB_UA_3_1_xenBotNames.GERTRUDE_G_XenEasyB_VG_3_1_xenBotNames.JAVIER_R_XenEasyC_V6_2_0_WWWWWWWWWWW0_9_XenHardA_Uy_3_1_xenBotNames.BETTY_J_XenEasyC_Wq_3_1_xenBotNames.JANNET_P_XenEasyC_VG_KjUDtLR_1_WWWWWWWWWWW1_D_1_1_1_1_2_3_A_K_1_3_1_xenBotNames.RICARDO_O_XenEasyB_Uy_3_1_xenBotNames.GERTRUDE_G_XenEasyB_cS_3_1_xenBotNames.CHAN_I_XenEasyA_Oi_2_0_WWWWWWWWWWW1_D_XenHardA_Uy_3_1_xenBotNames.JANNET_P_XenEasyC_VG_3_1_xenBotNames.LINDA_N_XenMedB_VG_KjUDtLR_2_WWWWWWWWWWW2_C_0_1_1_1_2_3_A_K_1_3_1_xenBotNames.JANNET_P_XenEasyC_Oi_3_1_xenBotNames.RICARDO_O_XenEasyB_Uy_3_1_xenBotNames.JAVIER_R_XenEasyC_cm_2_0_WWWWWWWWWWW2_C_XenHardA_Uy_3_1_xenBotNames.BETTY_J_XenEasyC_Uy_3_1_xenBotNames.GERTRUDE_G_XenEasyB_VG_KjUDtLR_3_WWWWWWWWWWW4_A_0_1_1_1_2_3_A_K_1_3_1_xenBotNames.JAVIER_R_XenEasyC_YE_3_1_xenBotNames.BETTY_J_XenEasyC_UA_3_1_xenBotNames.RICARDO_O_XenEasyB_V6_2_0_WWWWWWWWWWW4_A_XenHardA_Uy_3_1_xenBotNames.JANNET_P_XenEasyC_Uy_3_1_xenBotNames.GERTRUDE_G_XenEasyB_UA_KjUEtiI_4_A00000000000_0_1_1_1_1_2_3_A_K_1_3_1_xenBotNames.LINDA_N_XenMedB_VG_3_1_xenBotNames.RICARDO_O_XenEasyB_VG_3_1_xenBotNames.JANNET_P_XenEasyC_XI_2_0_A00000000000_0_XenHardA_Uy_3_1_xenBotNames.GERTRUDE_G_XenEasyB_TY_3_1_xenBotNames.CHAN_I_XenEasyA_VG');
testRoundTrip(range, '1.29_2_0_2_A_KjUDtLQ_6_0 1 70000 0 0MMMMMMMMMMM_H5m_13 3 71000 1 WWWWWWWWWWW1_5np_2 3 70000 2 2MMMMMMMMMMM_5ic_3 4 70000 3 3MMMMMMMMMMM_4HS_4 5 70000 3 4MMMMMMMMMMM_3Qm_0 1 1000 4 A00000000000_Fe_1_0_5_KjUDtLQ_5_0 1 700000 0 0AAAAAAAAAAA_2gvW_1 2 700000 1 1AAAAAAAAAAA_1LSm_2 3 700000 2 2AAAAAAAAAAA_uzs_3 4 700000 3 3AAAAAAAAAAA_gkO_4 5 700000 3 4AAAAAAAAAAA_YBW_4_5_KjUDtLR_0_WWWWWWWWWWW0_9_0_1_1_1_2_3_A_K_1_3_1_xenBotNames.RICARDO_O_XenEasyB_UA_3_1_xenBotNames.GERTRUDE_G_XenEasyB_VG_3_1_xenBotNames.JAVIER_R_XenEasyC_V6_2_0_WWWWWWWWWWW0_9_XenHardA_Uy_3_1_xenBotNames.BETTY_J_XenEasyC_Wq_3_1_xenBotNames.JANNET_P_XenEasyC_VG_KjUDtLR_1_WWWWWWWWWWW1_D_1_1_1_1_2_3_A_K_1_3_1_xenBotNames.RICARDO_O_XenEasyB_Uy_3_1_xenBotNames.GERTRUDE_G_XenEasyB_cS_3_1_xenBotNames.CHAN_I_XenEasyA_Oi_2_0_WWWWWWWWWWW1_D_XenHardA_Uy_3_1_xenBotNames.JANNET_P_XenEasyC_VG_3_1_xenBotNames.LINDA_N_XenMedB_VG_KjUDtLR_2_WWWWWWWWWWW2_C_0_1_1_1_2_3_A_K_1_3_1_xenBotNames.JANNET_P_XenEasyC_Oi_3_1_xenBotNames.RICARDO_O_XenEasyB_Uy_3_1_xenBotNames.JAVIER_R_XenEasyC_cm_2_0_WWWWWWWWWWW2_C_XenHardA_Uy_3_1_xenBotNames.BETTY_J_XenEasyC_Uy_3_1_xenBotNames.GERTRUDE_G_XenEasyB_VG_KjUDtLR_3_WWWWWWWWWWW4_A_0_1_1_1_2_3_A_K_1_3_1_xenBotNames.JAVIER_R_XenEasyC_YE_3_1_xenBotNames.BETTY_J_XenEasyC_UA_3_1_xenBotNames.RICARDO_O_XenEasyB_V6_2_0_WWWWWWWWWWW4_A_XenHardA_Uy_3_1_xenBotNames.JANNET_P_XenEasyC_Uy_3_1_xenBotNames.GERTRUDE_G_XenEasyB_UA_KjUEtiI_4_A00000000000_0_1_1_1_1_2_3_A_K_1_3_1_xenBotNames.LINDA_N_XenMedB_VG_3_1_xenBotNames.RICARDO_O_XenEasyB_VG_3_1_xenBotNames.JANNET_P_XenEasyC_XI_2_0_A00000000000_0_XenHardA_Uy_3_1_xenBotNames.GERTRUDE_G_XenEasyB_TY_3_1_xenBotNames.CHAN_I_XenEasyA_VG');


function getTime() {
	return Date.now();
}

function log(text) {
	document.body.innerHTML += text + "<br>";
}
