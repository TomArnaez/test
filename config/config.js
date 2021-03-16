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


/** Email Settings */

//Email address
config.email.username = "informationhub.kings@gmail.com";
//Email password
config.email.password = "cpointisthebest";



config.media = {};
config.media.directory = "./media"
config.media.fileSize = 1 * 1024 * 1024 * 1024 // 1GB per file



module.exports = config;
