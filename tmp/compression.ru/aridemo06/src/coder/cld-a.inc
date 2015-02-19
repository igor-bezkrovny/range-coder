// *** Dword-oriented Rangecoder by Eugene D. Shelwien -- almost plain Asm

__int64 rc_MaxRange = 0x7FFFFFFFFFFFFFFF;
//uint	rc_1shl32   = 0x4F800000;
uint	rc_1shl63   = 0x5F000000;

uint rc_LowH;
uint rc_Low[2];
uint rc_Carry;		// Low carry flag
uint rc_FFNum;		// number of all-F dwords between Cache and Low
uint rc_Cache;		// cached low dword


class RangeCoder
{

public:

 void StartEncode ()
 {
   rc_Cache=0;
   rc_FFNum=0;
   __asm		{

			finit
			push	edx
			fstcw	word ptr [esp+0]
			or	byte ptr [esp+1],1100b
			fldcw	word ptr [esp+0]
			pop	edx

			// integer converter :)
			fld	dword ptr rc_1shl63
			// load 1.0 for rounding in encari
			fld1
			fadd	st(0),st(1) ; 1<<63+1
			// Load Low=0 onto a fpu stack
			fldz
			fsub	st(0),st(2) ; Low=-2^63
			// Load Range=1.0 onto fpu stack
			fild qword ptr rc_MaxRange
			}
 }


 void StartDecode()
 {
   rc_Carry=0;
   __asm		{

			finit
			push	edx
			fstcw	word ptr [esp+0]
			or	byte ptr [esp+1],1100b
			fldcw	word ptr [esp+0]
			pop	edx

			// integer converter :)
			fld	dword ptr rc_1shl63
			// load 1.0 for rounding in encari
			fld1
			fadd	st(0),st(1) ; 1<<63+1
			// Preinit Code with 0.0
			fldz
			// Load Range=1.0 onto fpu stack
			fild qword ptr rc_MaxRange
			}
   ShiftCode();
   ShiftCode();
   ShiftCode();
 }


 void FinishEncode( void )
 {
   _asm 		{
			fld1
			faddp st(2),st(0) // Low+=1
			}
   ShiftLow();
   ShiftLow();
   ShiftLow();
 }


 void FinishDecode( void ){}


 inline void Encode(uint cumFreq, uint freq, uint totFreq)
 {
   uint HaiFreq[2]; HaiFreq[1] = cumFreq+freq;
   _asm 		{
			fidiv	totFreq     // Range/=Total
			fld	st(0)
			fimul	dword ptr HaiFreq+4 // (Range/Total)*H
			fxch	st(1)	    // Range/Total, ^, 1
			fimul	cumFreq     // (Range/Total)*L
			fadd	st(0),st(3) // LH+=1<<63+1
			fsub	st(0),st(4) // LH-=1<<63
			fadd	st(2),st(0) // Low+=LH
			fsubp	st(1),st(0) // Range=HL-LH
			fist	dword ptr HaiFreq+4
			cmp	dword ptr HaiFreq+4,0
			jl	QuitEncode
			; eax<80000000
			fstp	st(0) ; drop Range
			mov	dword ptr HaiFreq+0,0FFFFFFFFh
			fild	qword ptr HaiFreq+0
			}
			ShiftLow();
  QuitEncode:		{}

 }



inline void ShiftLow( void )
{ 
  _asm			{
			fxch	st(1)
			fistp	qword ptr rc_Low+0
			mov	eax,dword ptr rc_Low+0
			mov	edx,dword ptr rc_Low+4 ; high dword
			; rc_LowH = (rc_Low[1]<<1) + (rc_Low[0]>>31);
			shld	edx,eax,1
			mov	rc_LowH,edx
			sbb	ecx,ecx ; =-1 - no carry; rc_Carry
			or	eax,80000000h ; set high bit
			mov	dword ptr rc_Low+4,eax
			mov	dword ptr rc_Low+0,0
			fild	qword ptr rc_Low+0
			fxch	st(1)
			; Low loaded back
			cmp	edx,0FFFFFFFFh
			jnz	NoIncrementFFNum ; =FF..FF?
			inc	rc_FFNum
			jmp	QuitShiftLow
NoIncrementFFNum:	mov	rc_Carry,ecx ; (-1) if carry=0, 0 else
			inc	ecx
			add	rc_Cache,ecx ; rc_Cache+=(1+rc_Carry)
			}
			OutTgtDword( rc_Cache );
  _asm		{	cmp	rc_FFNum,0
			jz	SkipFFRun	}
StoreFFRun:{}		OutTgtDword( rc_Carry );
  _asm		{	dec	rc_FFNum
			jnz	StoreFFRun	}
SkipFFRun:{}
  _asm		{	mov	eax,rc_LowH
			mov	rc_Cache,eax	}
QuitShiftLow:{}

}


 inline uint GetFreq (uint totFreq)
 {
   _asm 		{
			fild	totFreq
			fmul	st(0),st(2) ; ChTotal * Code
			fdiv	st(0),st(1) ; /Range
			fistp	totFreq
			}
   return totFreq;
 }



 inline void Decode(uint cumFreq, uint freq, uint totFreq)
 {
   uint HaiFreq[2]; HaiFreq[1] = cumFreq+freq;
   _asm 		{
			fidiv	totFreq     // Range/=Total
			fld	st(0)
			fimul	dword ptr HaiFreq+4  // (Range/Total)*H
			fxch	st(1)	    // Range/Total, ^, 1
			fimul	cumFreq     // (Range/Total)*L
			fadd	st(0),st(3) // LH+=1<<63+1
			fsub	st(0),st(4) // LH-=1<<63
			fsub	st(2),st(0) // Code-=LH
			fsubp	st(1),st(0) // Range=HL-LH
			fist	dword ptr HaiFreq+4
			cmp	dword ptr HaiFreq+4,0
			jl	QuitDecode
			; eax<80000000
			fstp	st(0) ; drop Range
			mov	dword ptr HaiFreq+0,0FFFFFFFFh
			fild	qword ptr HaiFreq+0
			}
			ShiftCode();
  QuitDecode:		{}

 }


 inline void ShiftCode( void )
 {
   rc_Low[0] = InpSrcDword();
   _asm 		{
			fxch	st(1) // integer Code <2^32
			fistp	dword ptr rc_Low+4
			shr	rc_Carry,1
			rcr	dword ptr rc_Low+0,1
			rcl	rc_Carry,1
			fild	qword ptr rc_Low+0
			fxch	st(1) // put it back
			}
 }


};

