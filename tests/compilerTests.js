var mocha = require("mocha"),
    should = require("chai").should(),
    cm = require("../index.js");

describe("compiler", function () {
    it("should start CM", function (done) {
        this.timeout(40 * 1000);
        cm.start();
        
        // onStart.then(done, done).catch(done);
    });
    
//     it("should set environment variables", function () {
//         cm.setEnvironmentVariables();
//         process.env["CM_ARCH"].should.be.equal("win64");
//     });
// 
//     it("should kill CM", function () {
//         var code = cm.kill();
//         code.indexOf("terminated").should.be.above(-1);
//     });
});