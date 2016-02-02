module.exports = new (function (proc, psFind) {
    var self = this,
        _cm = null,
        env_vars_set = false;

    this.start = function (cm_path, readyCallback) {
        self.setEnvironmentVariables();
        self.kill();

        _cm = proc.spawn(cm_path, ["/develop", "/nocoloring", "/clean"]);

        _cm.stdout.on("data", function (data) {
            console.log("stdout", data.toString());
        });

        _cm.stderr.on("data", function (data) {
            console.log("stderr", data.toString());
        });

        _cm.on("exit", function (code) {
            console.log("Child exited with code", code);
        });
        
        setTimeout(function () {
            console.log("sending command");
            _cm.stdin.write("pln(\"Hello\");\x01");
        }, 10000);
        
        return new Promise(function(resolve, reject){
            reject();    
        });
    };

    this.kill = function() {
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
        
        var CET_DEV = "C:\\CetDev\\version6.5\\";

        process.env["CM_ARCH"] = "win64";
        process.env["CM_ENVFILE_EMACS"] = CET_DEV + "write\\_emacs.cmenv";
        process.env["CM_ENVFILE_OPERATOR"] = CET_DEV + "write\\_operator.cmenv";
        process.env["CM_HOME"] = CET_DEV + "home";
        process.env["CM_LIBS"] = CET_DEV + "write\\data\\cm-libs\\win64";
        process.env["CM_ROOT"] = CET_DEV;
        process.env["CM_UNIX_HOME"] = "C:/CetDev/version6.5/home";
        process.env["CM_UNIX_WRITE"] = "C:/CetDev/version6.5/write";
        process.env["CM_VCVERSION"] = "10";
        process.env["CM_WRITE"] = "C:\\CetDev\\version6.5\\write";
        process.env["PATH"] = process.env["PATH"] + ";" + process.env["CM_HOME"] + "\\bin\\";
    }
})(require("child_process"), require("ps-node"));