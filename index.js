module.exports = new (function (proc, psFind) {
    var self = this,
        _cm = null,
        _cmExecutable = "_cm.exe",
        env_vars_set = false,
        _onRead = null,
        _onError = null,
        _onExit = null;

    this.setup = function (onRead, onError, onExit) {
        _onRead = onRead;
        _onError = onError;
        _onExit = onExit;
    };

    this.start = function (cm_path) {
        return new Promise(function (resolve, reject) {
            if (cm_path) {
                _cmExecutable = cm_path;
            }

            self.setEnvironmentVariables();
            self.kill();

            _cm = proc.spawn(_cmExecutable, ["/develop", "/nocoloring"]);

            _cm.stdout.on("data", function (data) {
                if (_onRead)
                    _onRead(data.toString());

                if (data.indexOf("startup done in") > -1) {
                    resolve(true);
                }
            });

            _cm.stderr.on("data", function (data) {
                if (_onError)
                    _onError(data.toString());
                else
                    throw new Error(data.toString());
            });

            _cm.on("exit", function (code) {
                if (_onExit)
                    _onExit(code);
            });
        });
    };
    
    this.write = function(data) {
        return new Promise(function(resolve, reject) {
            _cm.stdin.write(data + "\x01");
            resolve();
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

        var CM_ROOT = "C:\\CetDev\\version6.5",
            CM_HOME = CM_ROOT + "\\home",
            CM_WRITE = CM_ROOT + "\\write";

        process.env["CM_ARCH"] = "win64";
        process.env["CM_ENVFILE_EMACS"] = CM_WRITE + "\\_emacs.cmenv";
        process.env["CM_ENVFILE_OPERATOR"] = CM_WRITE + "\\_operator.cmenv";
        process.env["CM_HOME"] = CM_HOME;
        process.env["CM_LIBS"] = CM_WRITE + "\\data\\cm-libs\\win64";
        process.env["CM_ROOT"] = CM_ROOT;
        process.env["CM_UNIX_HOME"] = CM_HOME;
        process.env["CM_UNIX_WRITE"] = CM_WRITE;
        process.env["CM_VCVERSION"] = "10";
        process.env["CM_WRITE"] = CM_WRITE;
        process.env["PATH"] = process.env["PATH"] + ";" + CM_HOME + "\\bin\\;" + CM_HOME + "\\bin\\win64;";
    }
})(require("child_process"), require("ps-node"));