if (%1)==(!!!) goto Action

for %%a in (su,sh,es) do call %0 !!! %%a
goto Exit

:Action
for %%a in (0,1,2,3) do icl /DCoder%2 /DModel%%a aridemo.cpp /link /OUT:%2_v%%a_i.exe


:Exit

