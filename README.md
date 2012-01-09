


    var lh = require("locale-host");
    // ... as part of your ExpressJS setup ...
    app.use(lh.middleware({
        baseHost:       "example.org"
    ,   locales:        ["en", "fr"]
    ,   https:          false
    ,   defaultLocale:  "en"
    }));

baseHost and locales are required. baseHost should include port, if any

https might be automatically guessed in the future (if possible), defaults to false

defaultLocale can also be a function that takes req, res, locales, next. defaults to first option in locales

this integrates with locale() from node-jus-i18n, adds it is not present
it is recommended to place it before this with enableForApp

uriWithLocale is added to req.
