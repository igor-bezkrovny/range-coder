set LIB=e:\intel_c\compil~1\lib
set INCLUDE=c:\_ARIDEMO\INCLUDE
cl /Ie:\intel_c\compil~1\include /Ox /Oi /G6 /MD aridemo.cpp /link /opt:nowin98
del aridemo.obj
