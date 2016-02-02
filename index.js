module.exports = new (function (proc, psFind) {
    var self = this,
        _cm = null,
        _cmExecutable = "_cm.exe",
        env_vars_set = false,
        _onRead = null,
        _onError = null,
        _onExit = null,
        _options = null;

    this.setup = function (onRead, onError, onExit, options) {
        _onRead = onRead;
        _onError = onError;
        _onExit = onExit;
        _options = options;
    };

    this.start = function (options) {
        return new Promise(function (resolve, reject) {
            if (options && options.cmPath) {
                _cmExecutable = options.cmPath;
            }
            
            self.setEnvironmentVariables();
            self.kill();

            _cm = proc.spawn(_cmExecutable, ["/develop", "/nocoloring"]);

            _cm.stdout.on("data", function (data) {
                data = data.toString();
                
                if (_onRead)
                    _onRead(data);

                if (_isCompilerReady(data)) {
                    resolve(true);
                }
            });

            _cm.stderr.on("data", function (data) {
                data = data.toString();
                
                if (_onError)
                    _onError(data);
                else
                    throw new Error(data);
            });

            _cm.on("exit", function (code) {
                if (_onExit)
                    _onExit(code);
            });
        });
    };

    this.write = function (data) {
        var cmd = _makeCommand(data);
        
        if(_options && _options.debug)
            console.log(data);
        
        _cm.stdin.write(cmd);
    };

    this.runFile = function (file) {
        file = file.replace(/\\/g, "");
        var cmd = "run(\"" + file + "\");";
        self.write(cmd);
    };
    
    this.compileFile = function (file) {
        file = file.replace(/\\/g, "");
        var cmd = "load(\"" + file + "\");";
        self.write(cmd);
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

        var CM_ROOT = _options && _options.cmRoot || "C:\\CetDev\\version6.5",
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
    
    function _makeCommand(data) {
        return data + "\x01";
    }
    
    function _isCompilerReady(data) {
        return data.match(/cm>$/g);
    }
})(require("child_process"), require("ps-node"));