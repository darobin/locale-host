
var _ = require("underscore");

exports.middleware = function (opts) {
    if (!opts) throw new Error("Options required for locale-host.")
    if (!opts.baseHost) throw new Error("Option 'baseHost' is required for locale-host.");
    if (!opts.locales) throw new Error("Option 'locales' is required for locale-host.");
    var https = !!opts.https
    ,   defaultLocale = opts.defaultLocale || opts.locales[0]
    ,   baseHost = opts.baseHost.toLowerCase()
    ,   locales = _.map(opts.locales, function (loc) { return loc.toLowerCase(); })
    ,   hostRE = new RegExp('\.?' + baseHost + '\.?$')
    ;
    
    // extract a locale from a request
    function localeFromRequest (req) {
        var host = req.headers.host;
        if (!host) return;
        host = host.toLowerCase();
        host = host.replace(hostRE, "");
        if (!host) return;
        if (locales.some(function (loc) { loc == host; })) return host;
        else return;
    }
    
    // build a URI with the given locale host
    http.IncomingMessage.prototype.requestURLWithLocale = function (locale) {
        return (https ? "https" : "http") + "://" + locale + "." + baseHost + this.url;
    }
    
    // redirect to a specific locale-host
    function redirectToLocaleHost (req, res, locale) {
        res.redirect(req.requestURLWithLocale(locale));
    }
    
    // setup a locale() method on requests if there isn't already one
    if (!_.isFunction(http.IncomingMessage.prototype.locale)) {
        http.IncomingMessage.prototype.locale = function (newValue) {
            if (newValue) this._locale_from_host = newValue;
            return this._locale_from_host;
        };
    }
    
    return function (req, res, next) {
        var loc = localeFromRequest(req);
        if (loc) {
            req.locale(loc);
            next();
        }
        else {
            if (_.isFunction(defaultLocale)) {
                defaultLocale(req, res, locales, function (err, loc) {
                    if (err) redirectToLocaleHost(req, res, locales[0]);
                    else redirectToLocaleHost(req, res, loc);
                });
            }
            else {
                redirectToLocaleHost(req, res, defaultLocale.toLowerCase());
            }
        }
    };
};
