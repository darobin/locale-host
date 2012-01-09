
## Overview

locale-host is a simple plugin for ExpressJS (it could be made to work with raw
NodeJS, I think it only uses res.redirect() from ExpressJS) that supports setting
the locale through the host name, e.g.: http://en.example.org/, 
http://fr.example.org/, etc.

You provide it with a list of accepted locales, as well as a default one, and either
it can find the locale for a given request and makes it available for other code
to use, or it can't and will redirect to the default locale.

It is designed to integrate with [node-jus-i18n](https://github.com/naholyr/node-jus-i18n)
if it's there (or any other module that adds a locale() method to HTTP requests).

## Example

    var lh = require("locale-host");

    // ... as part of your ExpressJS setup ...
    app.use(lh.middleware({
        baseHost:       "example.org"
    ,   locales:        ["en", "fr"]
    ,   https:          false
    ,   defaultLocale:  "en"
    }));

    // ... in any code that handles a request ...
    var current_locale = req.locale();
    

## Installation

    $ npm install locale-host

## Interface

This module exports a single method: middleware(). It is designed to generate an ExpressJS middleware
based on a set of options. You should place it *before* any code that uses locale information.

The options that middleware() accepts are:

- baseHost (required). This is the host without the locale subdomain. If you want en.example.org, then
this is "example.org".
- locales (required). This is an array of the locales that you accept in your application.
- https (defaults to false). Indicates whether you're using HTTPS (and therefore redirects should be
to https:// URIs). This *may* be autodetected in the future (if possible).
- defaultLocale. The default locale to redirect to for requests that don't have a locale. A simple string that
if omitted, defaults to the first values in locales. It can also be a callback (which can prove useful if you
want to default the locale depending for instance on the user's IP). The arguments that the callback
takes are: req, res, locales, next; where req and res are the usual request and response, locales is the
list of locales that the application has been configured to accept, and next is a callback to call when
the default locale has been determined (this allows you to do so in an asynchronous fashion). The next
callback expects to be called with an error and a locale. If it is called with an error it will just
redirect to the first locale in locales as a fallback; otherwise it will use the provided locale.

In middleware that is placed after locale-host, two methods are available on req:

- locale(). Returns the locale that was set through the host. Note that this is the same method that
is used by node-jus.i18n (on purpose). If for whatever reason you wish to override the locale for
this host, you can do so by passing this method a value (do this only if you know what you're doing
though).
- uriWithLocale(locale). Provided a locale, this returns a URI with the same features as the one of the
current request but with the given locale in the host. Say you are visiting http://en.example.org/foo,
calling req.uriWithLocale("fr") will return http://fr.example.org/foo. This is particularly useful for
the generation of language switching menus.

## License 

(The MIT License)

Copyright (c) 2011-2012 Robin Berjon &lt;robin@berjon.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
