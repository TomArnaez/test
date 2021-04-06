var mysql = require('mysql');

var config = require('./config/config.js');

var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : config.mysql.host,
    database        : config.mysql.name,
    user            : config.mysql.user,
    password        : config.mysql.pass,
    multipleStatements: true
});

module.exports = pool;