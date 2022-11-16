var mysql = require("mysql2");

var con = mysql.createConnection({

    host:"localhost",
    user:"root",
    password:"Mihir12345@",
    database:"streamon"
});

module.exports = con;