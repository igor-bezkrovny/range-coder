// cdr_subb = Carryless Rangecoder by D.Subbotin
// cdr_shin = Rangecoder by M.Schindler
// cdr_cl-d = CL-D rangecoder by E.Shelwien

#ifdef Codersu
#define Coder "CODER/subbotin.inc"
#else
#ifdef Codersh
#define Coder "CODER/shindler.inc"
#else
#ifdef Coderes
#define Coder "CODER/cld-a.inc"
//#define Coder "CODER/cld-c.inc"
#else
#define Coder "CODER/subbotin.inc" //default
#endif
#endif
#endif

// o0c_v0 = simple D.Shkarin's order0 model using freq array
// o0c_v1 = more useful D.Shkarin's order0 model using MtF symbol list
// o0c_v2 = more efficient D.Shkarin's order0 model using freq array again :)
//semenyk = VSORDER#3 by V.Semenyuk; binary tree etc

#ifdef Model0
#define Model "MODEL/o0c_v0.inc"
#else
#ifdef Model1
#define Model "MODEL/o0c_v1.inc"
#else
#ifdef Model2
#define Model "MODEL/o0c_v2.inc"
#else
#ifdef Model3
#define Model "MODEL/o0c_vs4.inc"
#else
#define Model "MODEL/o0c_v1.inc" //default
#endif
#endif
#endif
#endif

// io_ramd = dynamic ram usage
// io_rams = static ram usage
// io_file = file input/output

#ifdef ioD
#define IOModel "IOLIB/io_ramd.inc"
#else
#ifdef ioS
#define IOModel "IOLIB/io_rams.inc"
#else
#ifdef ioF
#define IOModel "IOLIB/io_file.inc"
#else
#define IOModel "IOLIB/io_ramd.inc" //default
#endif
#endif
#endif

