var mysql = require('mysql');
var prompt = require('prompt');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'k0@!@wala9',
    database: 'Bamazon'
});

//Check connection
connection.connect(function(err){
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
});

// ==== Challenge #1: Customer View ====
// Commented out initial insertion of rows into DB
/*
connection.query('INSERT INTO Bamazon.Products (ProductName, DepartmentName, Price, StockQuantity) VALUES ?', [[
        ['Drone', 'Electronics', 899.00, 120],
        ['Soylent 12 ct', 'Grocery', 32.30, 123],
        ['MacBook Pro', 'Electronics', 1292.34, 100],
        ['JavaScript for Dummies', 'Books', 25.49, 65],
        ['St. Vincent', 'Music', 10.00, 30],
        ['Remain in Light', 'Music', 6.99, 22],
        ['Airplane!', 'Movies', 5.46, 17],
        ['Drone Deluxe', 'Electronics', 1599.00, 42],
        ['Blackberry', 'Electronics', 4.99, 999],
        ['Luna Bars 15 pack Lemon', 'Grocery', 16.67, 345]
    ]], function(err, res) {
    if (err) {
        console.log(err);
    }
});
*/

// Pass in properties to prompt module
var schema = {
    properties: {
        productID: {
            description: 'Please enter the ID of the product you wish to purchase.',
            pattern: /^[\d\w]+$/,
            message: 'ID must be numerical.',
            required: true
        },
        units: {
            description: 'Please enter the quantity of units you would like to purchase. We will check our inventory and let you know if the total is available.',
            pattern: /^[\d\w]+$/,
            message: 'Quantity must be numerical.',
            required: true
        }
    }
};

function getCustOrder() {
    prompt.start();
    prompt.get(schema, function(err, res) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('productId: '+res.productID);
            console.log('units: '+res.units);
            connection.query('SELECT ItemID, ProductName, StockQuantity FROM Bamazon.Products WHERE ?', {ItemID: res.productID}, function(err2, res2) {
                if (err2) {
                    console.log(err2);
                }
                else if (res2[0].StockQuantity < res.units) {
                    console.log('Sorry, we do not have enough of ' + res2[0].ProductName + ' in stock.');
                    connection.end();
                }
                else {
                    console.log(res2[0].ProductName + ' is available!\n');
                    // Waiting animation for customer
                    var counter = 0;
                    var output = 'Grabbing your order';
                    var interval = setInterval(function() {
                        if (counter < 3) {
                            output += '. ';
                            process.stdout.write(output +'\r');
                            counter++;
                        }
                        else {
                            process.stdout.write(output +'Done!\n');
                            clearInterval(interval);
                            // Update database
                            var requestedUnits = res.units;
                            var newQty = res2[0].StockQuantity - requestedUnits;
                            connection.query('UPDATE Bamazon.Products SET StockQuantity = ? WHERE ItemID = ?', [newQty, res.productID], function(err3, res3) {
                                if (err3) {
                                    console.log(err3);
                                }
                                else {
                                    connection.query('SELECT ItemID, ProductName, Price, StockQuantity FROM Bamazon.Products WHERE ?', {ItemID: res.productID}, function(err4, res4) {
                                        if (err4) {
                                            console.log(err4);
                                        }
                                        else {
                                            console.log('=== Total Purchase ===\n' + 'Product: ' + res4[0].ProductName + '\nQty Purchased: ' + requestedUnits + '\nTotal: $' + (requestedUnits*res4[0].Price).toFixed(2));
                                        }
                                        connection.end();
                                    });
                                }
                            });
                            
                        }
                    }, 500);
                }
            });
        }
    });
}

// Read, then launch prompts & queries
connection.query('SELECT ItemID, ProductName, Price FROM Bamazon.Products', function(err, res) {
    if (err) {
        console.log(err);
    }
    else {
        console.log(res)
    }
    getCustOrder();
});
