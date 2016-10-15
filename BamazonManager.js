var mysql = require('mysql');
var inquirer = require('inquirer');
var sqlkey = require('./sqlkey.js')

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: sqlkey.key,
    database: 'Bamazon'
});

var queryCols1 = [['ItemID', 'ProductName', 'Price', 'StockQuantity']];
var productList = [];
var chosenProduct, amtToIncrease;
var newTotal = 0;

//Check connection
connection.connect(function(err){
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
    promptUserMain();
    // addToInv();
});

function viewProducts(callback) {
    connection.query('SELECT ?? from Bamazon.Products', queryCols1, function(err, res) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('\n========= Current Inventory =========')
            console.log(' | ' + 'Item' + ' | ' + 'Product' + ' | ' + 'Unit Prc' + ' | '+ 'Qty.' + ' | ');
            res.forEach(function(item) {
                productList.push(item.ProductName);
                console.log(' | ' + item.ItemID + ' | ' + item.ProductName +' | $' + item.Price + ' | ' + item.StockQuantity + ' | ')
            });
            console.log('\n')
            if (typeof callback === 'function'){
                callback();            
            }
        }
    });
}

function viewLowInv(callback) {
    connection.query('SELECT ?? from Bamazon.Products WHERE StockQuantity < 5', queryCols1, function(err, res) {
        if (err) throw err;
        else {
            console.log('\n=========== Low Inventory ===========')
            console.log(' | ' + 'Item' + ' | ' + 'Product' + ' | ' + 'Unit Prc' + ' | '+ 'Qty.' + ' | ');
            res.forEach(function(item) {
                console.log(' | ' + item.ItemID + ' | ' + item.ProductName +' | $' + item.Price + ' | ' + item.StockQuantity + ' | ')
            });
            console.log('\n')
            if (typeof callback === 'function'){
                callback();            
            }
        }
    });
}

function addToInv() {
    inquirer.prompt([{
        type: 'list',
        message: 'Please select a product to update.',
        choices: productList,
        name: 'chosenProduct'
    }, {
        type: 'input',
        message: 'Please enter # of product to add.',
        validate: function(input) {
            if (input.toString()[0] === '-') {
                console.log('\nNo negative numbers.');
            };
            return (input.toString()[0] !== '-');
        },
        name: 'amtToIncrease'
    }
    ]).then(function(ans){
        chosenProduct = ans.chosenProduct;
        amtToIncrease = ans.amtToIncrease;
        connection.query('SELECT ?? from Bamazon.Products WHERE ProductName = ?', [queryCols1, chosenProduct], function(err, ans) {
            if (err) throw err;
            else {
                newTotal = parseInt(ans[0].StockQuantity) + parseInt(amtToIncrease);
                inquirer.prompt([{
                    type: 'list',
                    message: 'User requested to increase ' + chosenProduct + ' by ' + amtToIncrease + ' for a new total of '+ newTotal + '. Proceed?',
                    choices: ['Yes', 'No'],
                    name: 'userConfirm'
                }]).then(function(ans2){
                    if (ans2.userConfirm === 'Yes') {
                        connection.query('UPDATE Bamazon.Products SET StockQuantity = ? WHERE ProductName = ?', [newTotal, chosenProduct], function(err, ans) {
                            if (err) throw err;
                            console.log('Update succeeded.');
                            continueApp();
                        });
                    }
                    else {
                        console.log('Product inventory increase cancelled.')
                        continueApp();
                    }
                });
            }
        });
    });
}

function addNewProduct() {
    inquirer.prompt([{
        type: 'input',
        message: 'Please enter name of new product.',
        name: 'newProductName'
    }, {
        type: 'input',
        message: 'Please enter department for new product.',
        name: 'newProductDept'
    }, {
        type: 'input',
        message: 'Please enter price of new product.',
        // validate: function(input){
        //     if (typeof input !== 'number') {
        //         console.log('Please enter a number.')
        //     }
        //     return (typeof input === 'number');
        // },
        name: 'newProductPrc'
    }, {
        type: 'input',
        message: 'Please enter inventory quantity of new product.',
        // validate: function(input){
        //     if (typeof (parseInt(input)) !== 'number') {
        //         console.log('Please enter a number.')
        //     }
        //     return (typeof input === 'number');
        // },
        name: 'newProductQty'
    }]).then(function(ans){
        var newProductName = ans.newProductName;
        var newProductDept = ans.newProductDept;
        var newProductPrc = ans.newProductPrc;
        var newProductQty = ans.newProductQty;
        inquirer.prompt([{
            type: 'list',
            message: 'User requested to add ' + newProductName + ' in ' + newProductDept + ' department, with a unit price of $' + newProductPrc + ', and an initial inventory of ' + newProductQty+ '. Proceed?',
            choices: ['Yes', 'No'],
            name: 'userConfirm'
        }]).then(function(ans2) {
            if (ans2.userConfirm === 'Yes') {
                if (productList.indexOf(newProductName) > -1) {
                    console.log('Product is already in database. Please choose \'Add to Inventory\' from main menu instead.');
                    continueApp();
                }
                else {
                    console.log('else')
                    connection.query('INSERT INTO Bamazon.Products (ProductName, DepartmentName, Price, StockQuantity) VALUES ?', [[[newProductName, newProductDept, newProductPrc, newProductQty]]], function(err, ans) {
                        if (err) throw err;
                        console.log('Update succeeded.');
                        continueApp();
                    });
                }
            }
            else {
                console.log('Product add cancelled.');
                continueApp();
            }    
        });
    });
}

function promptUserMain(){
    inquirer.prompt([{
        type: 'list',
        message: 'Please select an action.',
        choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
        name: 'action'
    }]).then(function(ans){
        switch(ans.action){
            case 'View Products for Sale':
                viewProducts(continueApp);
                break;
            case 'View Low Inventory':
                viewLowInv(continueApp);
                break;
            case 'Add to Inventory':
                viewProducts(addToInv);
                break;
            case 'Add New Product':
                viewProducts(addNewProduct);
                break;
            default:
                console.log('Nothing selected');
                
                break;
        }
    });
}

function continueApp() {
    inquirer.prompt([{
        type: 'list',
        message: 'Run another transaction?',
        choices: ['Yes', 'No'],
        name: 'action'
    }]).then(function(ans) {
        if (ans.action === 'Yes') {
            promptUserMain();
        }
        else {
            console.log('\n~~~Closing Manager View. Goodbye!~~~\n');
            connection.end();
        }
    });
}




