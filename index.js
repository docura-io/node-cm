var proc = require("child_process");

module.exports = function (options) {
    var self = this,
        _cm = null,
        _options = options,
        _onRead = _options && _options.onRead || null,
        _onError = _options && _options.onError || null,
        _onExit = _options && _options.onExit || null,
        CM_ROOT = _options && _options.cmRoot || "C:\\CetDev\\version6.5",
        CM_HOME = _options && _options.gitMode ? CM_ROOT + "\\base" : CM_ROOT + "\\home";
        // CM_WRITE = CM_ROOT + "\\write",

    this.start = function (options) {
        return new Promise(function (resolve, reject) {
            var args = ["/nocoloring"];
            if (options && options.clean) {
                args.push("/clean");
            }
            // _cm = proc.spawn("c:\\CetDev\\version10.0\\setenv.cmd && " + _cmExecutable , args, {shell:true});
            if ( CM_ROOT.indexOf('9.5') > -1 ) {
                args = [CM_ROOT];
                _cm = proc.spawn(__dirname + "\\cmstartdev.cmd", args);
            } else {
                _cm = proc.spawn(CM_HOME+"\\bin\\cmstartdev.cmd", args);
            }            
			
            _cm.stdout.on("data", function (data) {
                data = data.toString();

                if (_onRead) {
                    _onRead(data);
                }

                if (_isCompilerReady(data)) {
                    resolve(true);
                }
            });

            _cm.stderr.on("data", function (data) {
                data = data.toString();
                // they have an echo that gets mad
                if ( !_onError ) throw new Error(data);
                // if (_onError)

                //     _onError(data);
                // else
                //     throw new Error(data);
            });
			
			_cm.on("error", function (error) {
                console.log("HELP");
				console.log(error);
            });

            _cm.on("exit", function (code) {
				console.log(code);
                if (_onExit)
                    _onExit(code);
            });
        });
    };

    this.write = function (data) {
        var cmd = _makeCommand(data);

        if (_options && _options.debug)
            console.log(data);

        _cm.stdin.write(cmd);
    };

    this.clean = function () {
        self.kill();
        // var r = proc.execSync("make --jobs -C \"" + CM_HOME + "\" \"clean-cm\"");
        var r = proc.execSync(CM_HOME+"\\bin\\cmstarttestclean.cmd");
        return r.toString();
    };

    this.runFile = function (file) {
        file = file.replace(/\\/g, "/");
        var cmd = "run(\"" + file + "\");";
        self.write(cmd);
    };

    this.compileFile = function (file) {
        file = file.replace(/\\/g, "/");
        var cmd = "load(\"" + file + "\");";
        self.write(cmd);
    };

    this.quitDebug = function () {
        var cmd = "quit();";
        self.write(cmd);
    };

    this.kill = function () {
        console.log("Killing pending processes");
        var code = proc.execSync(CM_HOME + "\\bin\\cm_pskill /name \"_cm.exe\" /beginsWith \"msdev\" /beginsWith \"link\" /titleBeginsWith \"Microsoft Visual\"");
        console.log("All processes killed");
    };

    function _makeCommand(data) {
        return data + "\x01";
    }

    function _isCompilerReady(data) {
        return data.match(/cm>\s*$/g);
    }
}
