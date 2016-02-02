var CM_ROOT = "C:\\CetDev\\version6.5\\",
    CM_HOME = CM_ROOT + "home",
    proc = require("child_process");

process.env["CM_ARCH"] = "win64";
process.env["CM_ENVFILE_EMACS"] = CM_ROOT + "write\\_emacs.cmenv";
process.env["CM_ENVFILE_OPERATOR"] = CM_ROOT + "write\\_operator.cmenv";
process.env["CM_HOME"] = CM_HOME;
process.env["CM_LIBS"] = CM_ROOT + "write\\data\\cm-libs\\win64";
process.env["CM_ROOT"] = CM_ROOT;
process.env["CM_UNIX_HOME"] = CM_HOME;
process.env["CM_UNIX_WRITE"] = CM_ROOT + "write";
process.env["CM_VCVERSION"] = "10";
process.env["CM_WRITE"] = CM_HOME + "\\write";
process.env["PATH"] = process.env["PATH"] + ";" + CM_HOME + "\\bin\\" + ";" + CM_HOME + "\\bin\\win64";

var _cm = proc.spawn("C://CetDev//version6.5//home//bin//win64//_cm.exe", ["/develop", "/nocoloring"]);

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