:@echo off
if (%1)==(!!2) goto Action2
if (%1)==(!!!) goto Action

for %%a in (su,sh,es) do call %0 !!! %%a
goto Exit

:Action
for %%a in (0,1,2,3) do call %0 !!2 %2 %%a
goto Exit

:Action2
cl aridemo.cpp /Ox /G6 /DCoder%2 /DModel%3 /link /fixed:no /OUT:%2_v%3_v.exe

:Exit
