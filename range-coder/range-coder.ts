///<reference path="./o0c_v2a.ts"/>
///<reference path="./subbotin.ts"/>
module RANGECODER {

	function EncodeFile(data : number[]) : number[] {
		var io : IO = new IO(data);
		var rc : RangeCoder = new RangeCoder(io);
		io.writeDWORD(data.length);
		var o0c : ORDER_0_CODER = new ORDER_0_CODER(rc);
		console.log("EncodeFile: size = " + data.length);
		rc.StartEncode();
		while (!io.isEOF()) o0c.encodeSymbol(io.readByte());
		rc.FinishEncode();

		return io.getResult();
	}

	function DecodeFile(data : number[]) : number[] {
		var io : IO = new IO(data),
			rc : RangeCoder = new RangeCoder(io),
			o0c : ORDER_0_CODER = new ORDER_0_CODER(rc),
			size : number = io.readDWORD(),
			processedBytes : number = 0;

		console.log("DecodeFile: size = " + size);
		rc.StartDecode();
		while (processedBytes < size) {
			io.writeByte(o0c.decodeSymbol());
			processedBytes++;
		}
		rc.FinishDecode();
		return io.getResult();
	}

	function main() {
		console.log("RANGECODER v1.04 (c) 2000-2001  Dmitry Shkarin, Eugene Shelwien");

		//var text = "Bringing unlocked me an striking ye perceive. Mr by wound hours oh happy. Me in resolution pianoforte continuing we. Most my no spot felt by no. He he in forfeited furniture sweetness he arranging. Me tedious so to behaved written account ferrars moments. Too objection for elsewhere her preferred allowance her. Marianne shutters mr steepest to me. Up mr ignorant produced distance although is sociable blessing. Ham whom call all lain like.		Call park out she wife face mean. Invitation excellence imprudence understood it continuing to. Ye show done an into. Fifteen winding related may hearted colonel are way studied. County suffer twenty or marked no moment in he. Meet shew or said like he. Valley silent cannot things so remain oh to elinor. Far merits season better tended any age hunted.			Forfeited you engrossed but gay sometimes explained. Another as studied it to evident. Merry sense given he be arise. Conduct at an replied removal an amongst. Remaining determine few her two cordially admitting old. Sometimes strangers his ourselves her depending you boy. Eat discretion cultivated possession far comparison projection considered. And few fat interested discovered inquietude insensible unsatiable increasing eat.			Neat own nor she said see walk. And charm add green you these. Sang busy in this drew ye fine. At greater prepare musical so attacks as on distant. Improving age our her cordially intention. His devonshire sufficient precaution say preference middletons insipidity. Since might water hence the her worse. Concluded it offending dejection do earnestly as me direction. Nature played thirty all him.			He unaffected sympathize discovered at no am conviction principles. Girl ham very how yet hill four show. Meet lain on he only size. Branched learning so subjects mistress do appetite jennings be in. Esteems up lasting no village morning do offices. Settled wishing ability musical may another set age. Diminution my apartments he attachment is entreaties announcing estimating. And total least her two whose great has which. Neat pain form eat sent sex good week. Led instrument sentiments she simplicity.			Maids table how learn drift but purse stand yet set. Music me house could among oh as their. Piqued our sister shy nature almost his wicket. Hand dear so we hour to. He we be hastily offence effects he service. Sympathize it projection ye insipidity celebrated my pianoforte indulgence. Point his truth put style. Elegance exercise as laughing proposal mistaken if. We up precaution an it solicitude acceptance invitation.			Up unpacked friendly ecstatic so possible humoured do. Ample end might folly quiet one set spoke her. We no am former valley assure. Four need spot ye said we find mile. Are commanded him convinced dashwoods did estimable forfeited. Shy celebrated met sentiments she reasonably but. Proposal its disposed eat advanced marriage sociable. Drawings led greatest add subjects endeavor gay remember. Principles one yet assistance you met impossible.			Whether article spirits new her covered hastily sitting her. Money witty books nor son add. Chicken age had evening believe but proceed pretend mrs. At missed advice my it no sister. Miss told ham dull knew see she spot near can. Spirit her entire her called.			Am terminated it excellence invitation projection as. She graceful shy believed distance use nay. Lively is people so basket ladies window expect. Supply as so period it enough income he genius. Themselves acceptance bed sympathize get dissimilar way admiration son. Design for are edward regret met lovers. This are calm case roof and.			Literature admiration frequently indulgence announcing are who you her. Was least quick after six. So it yourself repeated together cheerful. Neither it cordial so painful picture studied if. Sex him position doubtful resolved boy expenses. Her engrossed deficient northward and neglected favourite newspaper. But use peculiar produced concerns ten.		!";
		//var text = "048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp048CGKOSWaeim159DHLPTXbfjn26AEIMQUYcgko37BFJNRVZdhlp";
		var text = "2Zl1oH_1_3_5_AAAAAAAAAAAA_2_BBBBBBBBBBBB_4_CCCCCCCCCCCC_5_DDDDDEEEEEEE_3_AAAA55555555_6_2_4_0_AWC000W0G0_3_0_wWN100W0H0_1_0_0_A_KkNFq1j_1_146K8_1a_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C_0_0_0_1_0_2_0_3_0_4_0_5_0_6_0_7_0_8_0_9_0_A_0_B_0_C_1_0_1_1_1_2_1_3_1_4_1_5_1_6_1_7_1_8_1_9_1_A_1_B_1_C_2_0_2_1_2_2_2_3_2_4_2_5_2_6_2_7_2_8_2_9_2_A_2_B_2_C_3_0_3_1_3_2_3_3_3_4_3_5_3_6_3_7_3_8_3_9_3_A_3_B_3_C";
		var data = text.split("").map(function (sym : string) {
			return sym.charCodeAt(0);
		});

/*
		var data : number[] = [];
		for(var i = 0; i < 100000; i++) data[i] = (Math.random() * 2) | 0;
*/


		console.log("source data: " + data.length + " bytes");
		var encodedData = EncodeFile(data);
		console.log("encoded data: " + encodedData.length + " bytes");

		var decodedData = DecodeFile(encodedData);
		console.log("decoded data: " + decodedData.length + " bytes");

		if (decodedData.length === data.length) {
			for (var i = 0; i < data.length; i++) {
				if (data[ i ] !== decodedData[ i ]) {
					console.log("different bytes from " + i + " byte!");
					return;
				}
			}
			console.log("equal!");
		} else {
			console.log("different size!!");
		}
	}

	window.onload = main;

}
