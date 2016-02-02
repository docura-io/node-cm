var mocha = require("mocha"),
    should = require("chai").should(),
    cm = require("../index.js");

describe("compiler", function () {
    //     it("should start CM", function (done) {
    //         this.timeout(40 * 1000);
    //         var onStart = cm.start();
    // 
    //         onStart.then(function (success) { if (success) done(); }, done).catch(done);
    //     });

    it("should write \"Hello World\"", function (done) {
        this.timeout(40 * 1000);
        var response = "";
        cm.setup(function (data) {
            console.log(data);
            response = data;
        });
        var onStart = cm.start();

        onStart.then(function (success) {
            console.log("started", success);
            if (success) {
                cm.write("pln(\"Hello World\");").then(function () {
                    console.log("got response");
                    response.should.be.equal("Hello World");
                    done();
                }, done).catch(done);
            }
        }, done).catch(done);
    });
    
    // it("should set environment variables", function () {
    //     cm.setEnvironmentVariables();
    //     
    //     process.env["CM_ARCH"].should.be.equal("win64");
    //     process.env["CM_ENVFILE_EMACS"].should.be.equal("C:\\CetDev\\version6.5\\write\\_emacs.cmenv");
    //     process.env["CM_ENVFILE_OPERATOR"].should.be.equal("C:\\CetDev\\version6.5\\write\\_operator.cmenv");
    //     process.env["CM_HOME"].should.be.equal("C:\\CetDev\\version6.5\\home");
    //     process.env["CM_LIBS"].should.be.equal("C:\\CetDev\\version6.5\\write\\data\\cm-libs\\win64");
    //     process.env["CM_ROOT"].should.be.equal("C:\\CetDev\\version6.5");
    //     process.env["CM_UNIX_HOME"].should.be.equal("C:\\CetDev\\version6.5\\home");
    //     process.env["CM_UNIX_WRITE"].should.be.equal("C:\\CetDev\\version6.5\\write");
    //     process.env["CM_VCVERSION"].should.be.equal("10");
    //     process.env["CM_WRITE"].should.be.equal("C:\\CetDev\\version6.5\\write");
    // });
    // 
    //     it("should kill CM", function () {
    //         var code = cm.kill();
    //         code.indexOf("terminated").should.be.above(-1);
    //     });
});