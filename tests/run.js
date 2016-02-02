var proc = require("child_process");

process.env["CM_ARCH"] = "win64" ;
process.env["CM_ENVFILE_EMACS"] = "C:\CetDev\version6.5\write\_emacs.cmenv" ;
process.env["CM_ENVFILE_OPERATOR"] = "C:\CetDev\version6.5\write\_operator.cmenv" ;
process.env["CM_HOME"] = "C:\CetDev\version6.5\home" ;
process.env["CM_LIBS"] = "C:\CetDev\version6.5\write\data\cm-libs\win64" ;
process.env["CM_ROOT"] = "C:\CetDev\version6.5" ;
process.env["CM_UNIX_HOME"] = "C:/CetDev/version6.5/home" ;
process.env["CM_UNIX_WRITE"] = "C:/CetDev/version6.5/write" ;
process.env["CM_VCVERSION"] = "10" ;
process.env["CM_WRITE"] = "C:\CetDev\version6.5\write" ;

var _cm = proc.spawn("C://CetDev//version6.5//home//bin//win64//_cm.exe", ["/develop /noColoring"]);

_cm.stdout.on("data", function (data) {
    console.log("stdout", data.toString());
});

_cm.stderr.on("data", function (data) {
    console.log("stderr", data.toString());
});

_cm.on("exit", function (code) {
    console.log("Child exited with code", code);
});

process.stdin.resume();