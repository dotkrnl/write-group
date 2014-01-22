
/**
 * App settings.
 */

var express = require('express');

var website = '$ write';
var defaultPort = 3000;
var cookieSecret = "secret";
var databaseInfo = {
    protocol : 'postgresql',
    host     : 'localhost',
    port     : '5432',
    user     : 'yourname',
    password : 'yourpassword',
    database : 'write-group',
    query    : { pool: true }
}

module.exports = {
    website: website,
    defaultPort: defaultPort,
    secret: cookieSecret,
    databaseInfo: databaseInfo,
    sessionDB: {
        secret: cookieSecret,
    },
    perpage: 25,
};
