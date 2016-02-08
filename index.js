var proc = require("child_process");

module.exports = function (options) {
    var self = this,
        _cm = null,
        env_vars_set = false,
        _options = options,
        _cmExecutable = _options && _options.cmPath || "_cm.exe",
        _onRead = _options && _options.onRead || null,
        _onError = _options && _options.onError || null,
        _onExit = _options && _options.onExit || null,
        CM_ROOT = _options && _options.cmRoot || "C:\\CetDev\\version6.5",
        CM_HOME = CM_ROOT + "\\home",
        CM_WRITE = CM_ROOT + "\\write",
        _maxStatementsInTheStack = 100,
        _stack = [],
        _entries = [];

    this.start = function (options) {
        return new Promise(function (resolve, reject) {
            self.setEnvironmentVariables();
            self.kill();

            var args = ["/develop", "/nocoloring"];

            if (options && options.clean) {
                args.push("/clean");
            }

            _cm = proc.spawn(_cmExecutable, args);

            _cm.stdout.on("data", function (data) {
                data = data.toString();
                
                _addToStack(data);
                
                _parseStackEntry(data);

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

        if (_options && _options.debug)
            console.log(data);

        _cm.stdin.write(cmd);
    };

    this.clean = function () {
        self.kill();
        
        var r = proc.execSync("make --jobs -C \"" + CM_HOME + "\" \"clean-cm\"");
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
    
    this.quitDebug = function() {
        var cmd = "quit();";
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
        process.env["PATH"] = process.env["PATH"] + ";" + CM_HOME + "\\bin\\;" + CM_HOME + "\\bin\\win64;C:\\Program Files (x86)\\CetDev\\gnu\\cygwin\\bin";
    }
    
    this.getStack = function() {
        return _stack;
    };
    
    this.getEntries = function() {
        return _entries;
    };
    
    function _addToStack(data) {
        if(_stack.length >= _maxStatementsInTheStack)
            _stack.shift();
            
        _stack.push(data);
    }
    
    function _parseStackEntry(data) {
        var entry = null;
        
        if(data.match(/error/g)) {
            entry = _parseErrorEntry(data);
        }
        
        if(entry) {
            if(_entries.length >= _maxStatementsInTheStack)
                _entries.shift();
            
            _entries.push(entry);
        }
    }
    
    function _parseErrorEntry(data) {
        var match = /([cC]:.*\.cm)\((\d+)\,\s{1}(\d+)\):\s*(.+)\s+\(/g.exec(data);

        if(match) {
            return {
              type: "error",
              filename: match[1],
              line: match[2],
              column: match[3],
              description: match[4]
            };
        }        
    }

    function _makeCommand(data) {
        return data + "\x01";
    }

    function _isCompilerReady(data) {
        return data.match(/cm>\s*$/g);
    }
}