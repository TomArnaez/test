var config = {};

config.mysql = {};
config.email = {};


/** MySQL settings */

//MySQL hostname
config.mysql.host = "95.217.93.94";
//MySQL database name
config.mysql.name = "cpoint_development";
//MySQL database username
config.mysql.user = "cpoint_development";
//MySQL database password
config.mysql.pass = "evPOXg0Oa4P9Z4xl";
config.mysql.dialect = 'mysql';
config.mysql.pool=  {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
}


/** Email Settings */

//Email address
config.email.username = "informationhub.kings@gmail.com";
//Email password
config.email.password = "cpointisthebest";



config.media = {};
config.media.directory = "./media"
config.media.fileSize = 1 * 1024 * 1024 * 1024 // 1GB per file



module.exports = config;
