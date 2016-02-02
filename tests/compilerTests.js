var mocha = require("mocha"),
    should = require("chai").should(),
    cm = require("../index.js");

describe("compiler", function () {
    it("should set environment variables", function () {
        cm.setEnvironmentVariables();
        process.env["CM_ARCH"].should.be.equal("win64");
    })

    it("should kill CM", function () {
        var code = cm.kill();
        code.indexOf("terminated").should.be.above(-1);
    })
});