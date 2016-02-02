module.exports = new (function (proc, psFind) {
    var self = this,
        _cm = null,
        _cm_exe = "_cm.exe",
        env_vars_set = false;

    this.start = function (cmPath) {
        if (cmPath)
            _cm_exe = cmPath;

        self.setEnvironmentVariables();
        self.kill();

        return new Promise(function (resolve, reject) {
            console.log("Starting", _cm_exe);
            _cm = proc.spawn(_cm_exe, ["/develop", "/nocoloring"]);

            _cm.stdout.on("data", function (data) {
                console.log("stdout", data.toString());
            });

            _cm.stderr.on("data", function (data) {
                console.log("stderr", data.toString());
            });

            _cm.on("exit", function (code) {
                console.log("Child exited with code", code);
            });
            
            setTimeout(function() {
                resolve();
            }, 60000);

            // setTimeout(function () {
            //     console.log("sending command");
            //     _cm.stdin.write("pln(\"Hello\");\x01");
            // }, 10000);
            
            // reject(new Error("Foo"));
        });
    };

    this.kill = function () {
        self.setEnvironmentVariables();

        console.log("Killing pending processes");
        var code = proc.execSync("cm_pskill /name \"_cm.exe\" /beginsWith \"msdev\" /beginsWith \"link\" /titleBeginsWith \"Microsoft Visual\"");
        console.log("All processes killed");
        return code;
    };

    this.setEnvironmentVariables = function () {
        if (env_vars_set) {
            return;
        } else {
            env_vars_set = true;
        }

        var CM_ROOT = "C:\\CetDev\\version6.5\\",
            CM_HOME = CM_ROOT + "home";

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
    }
})(require("child_process"), require("ps-node"));