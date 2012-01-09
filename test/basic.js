
var lh = require("../")
,   should = require("should")
;

// fake namespace that is being modified
http = {};
http.IncomingMessage = function () {};
http.IncomingMessage.prototype = {};
function resetFake () {
    http.IncomingMessage.prototype = {};
}


// fake objects
function fakeRequest (host, url) {
    var req = new http.IncomingMessage();
    req.url = url;
    req.headers = { host: host };
    return req;
}

function fakeResponse (redirectCB) {
    return {
        redirect: redirectCB
    };
}


// required parameters
describe("default parameters", function () {
    it("should throw for no options", function () {
        var threw = false;
        try { lh.middleware(); }
        catch (e) { threw = true; }
        threw.should.be.ok;
    });
    it("should throw for no baseHost", function () {
        var threw = false;
        try { lh.middleware({}); }
        catch (e) { threw = true; }
        threw.should.be.ok;
    });
    it("should throw for no locales", function () {
        var threw = false;
        try { lh.middleware({ baseHost: "example.org" }); }
        catch (e) { threw = true; }
        threw.should.be.ok;
    });
    it("should not throw", function () {
        var threw = false;
        try { lh.middleware({ baseHost: "example.org", locales: ["en", "fr"] }); }
        catch (e) { console.log(e); threw = true; }
        threw.should.not.be.ok;
    });
});

// different request types
function requests (mid, https) {
    var https = !!https
    ,   res = fakeResponse(function (redirect) {
            redirect.should.equal("http" + (https ? "s" : "") + "://en.example.org/path");
        })
    ,   url = "/path"
    ,   req
    ,   dontNext = function () { true.should.not.be.ok; }
    ,   goodNext = function () { true.should.be.ok; }
    ;
    
    // request with just baseHost
    it("should redirect from example.org to en.example.org", function () {
        req = fakeRequest("example.org", url);
        mid(req, res, dontNext);
    });

    // request with www.baseHost
    it("should redirect from www.example.org to en.example.org", function () {
        req = fakeRequest("www.example.org", url);
        mid(req, res, dontNext);
    });

    // request with notInLocales.baseHost
    it("should redirect from es.example.org to en.example.org", function () {
        req = fakeRequest("es.example.org", url);
        mid(req, res, dontNext);
    });

    // request with baseHost.
    it("should redirect from example.org. to en.example.org", function () {
        req = fakeRequest("example.org.", url);
        mid(req, res, dontNext);
    });

    // request with inLocales.baseHost (first, other)
    it("should not redirect from fr.example.org", function () {
        req = fakeRequest("example.org", url);
        mid(req, res, goodNext);
    });
}

// simple defaultLocale
describe("simple defaultLocale", function () {
    var mid = lh.middleware({
        baseHost:       "example.org"
    ,   locales:        ["de", "en", "fr"]
    ,   defaultLocale:  "en"
    });
    requests(mid);
});

// no defaultLocale defaults to first locales
describe("defaults to first locales", function () {
    var mid = lh.middleware({
        baseHost:       "example.org"
    ,   locales:        ["en", "de", "fr"]
    });
    requests(mid);
});

// function defaultLocale
describe("function defaultLocale", function () {
    it("should call defaultLocale() and handle async", function (done) {
        var req = fakeRequest("example.org", "/path")
        ,   res = fakeResponse(function (redirect) {
                redirect.should.equal("http://en.example.org/path");
                done();
            })
        ,   mid = lh.middleware({
                baseHost:       "example.org"
            ,   locales:        ["de", "en", "fr"]
            ,   defaultLocale:  function (req, res, locales, cb) {
                    cb(null, locales[1]);
                }
            });
        ;
        mid(req, res, function () { true.should.not.be.ok; });
    });
});

// check value of locale()
describe("sets locale()", function () {
    it("should set locale()", function () {
        var req = fakeRequest("en.example.org", "/path")
        ,   res = fakeResponse(function () {})
        ,   mid = lh.middleware({
                baseHost:       "example.org"
            ,   locales:        ["de", "en", "fr"]
            })
        ;
        should.not.exist(req.locale());
        mid(req, res, function () {
            req.locale().should.equal("en");
        });
    });
});

// check preserves existing locale
describe("check preserves existing locale()", function () {
    it("should not change locale()", function () {
        http.IncomingMessage.prototype.locale = function () { return "original"; };
        var req = fakeRequest("en.example.org", "/path")
        ,   res = fakeResponse(function () {})
        ,   mid = lh.middleware({
                baseHost:       "example.org"
            ,   locales:        ["de", "en", "fr"]
            })
        ;
        req.locale().should.equal("original");
        mid(req, res, function () {
            req.locale().should.equal("original");
        });
    });
});

// https
describe("https", function () {
    it("should be in https", function () {
        var mid = lh.middleware({
            baseHost:       "example.org"
        ,   locales:        ["de", "en", "fr"]
        ,   defaultLocale:  "en"
        ,   https:          true
        });
        requests(mid, true);
    });
});
