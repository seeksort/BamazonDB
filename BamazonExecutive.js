// ==== Challenge #3: Executive View ====

var mysql = require('mysql');
var inquirer = require('inquirer');
var sqlkey = require('./sqlkey.js');
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: sqlkey.key,
    database: 'Bamazon'
});

var table = new Table({
    head: ['DepartmentID', 'DepartmentName', 'OverHeadCosts', 'ProductSales', 'TotalProfit']
  , colWidths: [20, 20, 20, 20, 20]
});

// connection.query('CREATE TABLE Bamazon.Departments (DepartmentID INT(02) NOT NULL AUTO_INCREMENT, DepartmentName VARCHAR(70) NOT NULL, OverHeadCosts DECIMAL(10,2), TotalSales DECIMAL(10,2), PRIMARY KEY(DepartmentID))', function(err, res) {
//     if (err) {
//         console.log(err);
//     }
//     else {
//         connection.query('INSERT INTO Bamazon.Departments (DepartmentName, OverHeadCosts, TotalSales) VALUES ?', [[
//                 ['Electronics', 50000, 0],
//                 ['Grocery', 30000, 0],
//                 ['Books', 35000, 0],
//                 ['Music', 10000, 0],
//                 ['Movies', 10000, 0]
//             ]], function(err, res) {
//             if (err) {
//                 console.log(err);
//             }
//             else {
//                 connection.end();
//             }
//         });

//     }
// });

//Check connection
connection.connect(function(err){
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
    promptUserExec();
});

function promptUserExec() {
    inquirer.prompt([{
        type: 'list',
        message: 'Please select an action',
        choices: ['View Product Sales by Department', 'Create New Department'],
        name: 'action'
    }]).then(function(ans){
        switch(ans.action){
            case 'View Product Sales by Department':
                viewSalesByDept();
                break;
            case 'Create New Department':
                addNewDept();
                break;
            default:
                console.log('Nothing selected');
                
                break;
        } 
    });
}

function viewSalesByDept() {
    connection.query('SELECT * FROM Bamazon.Departments', function(err, res) {
        if (err) {
            console.log(err);
        }
        else {
            res.forEach(function(item) {
                var totProfit = item.TotalSales - item.OverHeadCosts;
                table.push(
                    [item.DepartmentID, item.DepartmentName, item.OverHeadCosts, item.TotalSales, totProfit]
                );
            });
            console.log(table.toString());
            connection.end();
        }
    });
}

function addNewDept() {
    inquirer.prompt([{
        type: 'input',
        message: 'Please enter a new department name',
        name: 'dept'
    }]).then(function(ans) {
        var newDept = ans.dept;
        inquirer.prompt([{
            type: 'list',
            message: 'New department ' + newDept + ' will be added. Proceed?',
            choices: ['Yes', 'No'],
            name: 'userConfirm'
        }]).then(function(ans){
            if (ans.userConfirm === 'Yes') {
                connection.query('INSERT INTO Bamazon.Departments (DepartmentName, OverHeadCosts, TotalSales) VALUES ?', 
                [[[newDept, 50000, 0]]], function(err, res) {
            if (err) {
                console.log(err);
            }
            else {
                connection.end();
            }
        });
            }
        });
    });
}