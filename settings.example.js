
/**
 * App settings.
 */

var express = require('express');
var mongoStore = require('connect-mongo')(express);

var website = '$ write';
var defaultPort = 3000;
var cookieSecret = "secret";
var databaseInfo = {
    db: 'write-group',
}

module.exports = {
    website: website,
    defaultPort: defaultPort,
    secret: cookieSecret,
    databaseInfo: databaseInfo,
    sessionDB: {
        secret: cookieSecret,
        store: new mongoStore(databaseInfo),
    },
    perpage: 25,
};
