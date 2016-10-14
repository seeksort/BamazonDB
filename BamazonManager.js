var mysql = require('mysql');
var prompt = require('prompt');
var sqlkey = require('./sqlkey.js')

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: sqlkey.key,
    database: 'Bamazon'
});

//Check connection
connection.connect(function(err){
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
});