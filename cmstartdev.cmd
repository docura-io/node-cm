@echo off

pushd "%~dp0"

      call %1\setenv
      set libDirTarget=%CM_WRITE%\data\cm-libs\win64
      if not exist "%libDirTarget%" mkdir "%libDirTarget%"
      xcopy /y "%CM_HOME%\partner\write\data\cm-libs\win64\*.cmlib" "%libDirTarget%"
      _cm.exe /develop /multiple_instances /nocoloring %CM_CLASSPATH_ARGS%

popd
