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

config.email.username = "informationhub.kings@gmail.com";  //Email address

config.email.password = "cpointisthebest";  //Email password

config.email.host = "smtp.gmail.com";  //host

config.email.port = 587;   //Port

config.email.secure = false;  //TLS


config.media = {};
config.media.directory = "./media"
config.media.fileSize = 1 * 1024 * 1024 * 1024 // 1GB per file



module.exports = config;
