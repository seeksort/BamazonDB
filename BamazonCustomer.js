var mysql = require('mysql');
var prompt = require('prompt');

var queryCols1 = [['ItemID', 'ProductName', 'Price', 'StockQuantity']];
var queryCols2 = [['ItemID', 'ProductName', 'Price']];
var requestedUnits, requestedID, availableQty;

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'k0@!@wala9',
    database: 'Bamazon'
});

// Pass in properties to prompt module on lines 76 and 77 
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

// Reads db then passes result to passed in callback
function readDB(args, callback) {
    connection.query('SELECT ?? FROM Bamazon.Products', args, function(err, res) {
        if (err) {
            console.log(err);
        }
        else {
            callback(res);
        }
    });
}

// Ask for order, then read DB, then execute evaluation callback
function getCustOrder(results) {
    console.log(results)
    prompt.start();
    prompt.get(schema, function(err, res) {
        if (err) {
            console.log(err);
        }
        else {
            requestedUnits = res.units;
            requestedID = res.productID;
            console.log('productId: '+ requestedID);
            console.log('units: '+ requestedUnits);
            readDB(queryCols1, evalCurrentStock);
        };
    });
}

// Evalutate stock pulled from DB
function evalCurrentStock(results) {
    availableQty = results[0].StockQuantity
    if (availableQty < requestedUnits) {
        console.log('Sorry, we do not have enough of ' + results[0].ProductName + ' in stock.');
        connection.end();
    }
    else {
        console.log(results[0].ProductName + ' is available!\n');
        waitingAnimation(processOrder);
    }
}

// Waiting animation for customer
function waitingAnimation(callback) {
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
            callback();
        }
    }, 500);
}

// Update database and show customer bill
function processOrder() {
    var newQty = availableQty - requestedUnits;
    connection.query('UPDATE Bamazon.Products SET StockQuantity = ? WHERE ItemID = ?', [newQty, requestedID], function(err3, res3) {
        if (err3) {
            console.log(err3);
        }
        else {
            readDB(queryCols1, function(result) {
                console.log('=== Total Purchase ===\n' + 'Product: ' + result[0].ProductName + '\nQty Purchased: ' + requestedUnits + '\nTotal: $' + (requestedUnits*result[0].Price).toFixed(2));
                connection.end();
            });
        }
    });
}
        
// Read, then launch prompts & queries
readDB(queryCols2, getCustOrder);