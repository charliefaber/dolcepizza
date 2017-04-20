// Server-Side Operations

// Reference npm dependencies
var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');

// MongoDB dependencies and variables
var mongo = require('mongodb');
var assert = require('assert');
var MongoClient = mongo.MongoClient;
//var url = "mongodb://charliefaber:1234567890987654321@ds163360.mlab.com:63360/pizzadb";
var url = "mongodb://dolcepizzaadmin:KsfRTTnXKjgvlKqjmrJfnf8jTP2MYgyE8FUDCO4ITnj1kENcg21BicuPUbECoapHBuqJuUnbWlgEEBFfiAoVqg==@dolcepizzaadmin.documents.azure.com:10250/pizzadb?ssl=true";

var app = express();    
var hbs = exphbs.create({
	helpers: {
   		inc: function(num) {return num+1;},
  	}
});

// Set handlebars options
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Set body-parser options
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Set express static directory
//app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

	// MongoClient.connect(url, function(err, db) {
	// 	assert.equal(null, err);
	// 	db.collection('users').dropIndexes();
 //  		db.close();
	// });

app.get('/', function (req, res) {
	console.log("Receiving request!");
  	res.sendFile(path.join(__dirname, "views/index.html"));
});

app.get('/menu', function(req, res) { 
	console.log("Receiving a menu request");
  	res.sendFile(path.join(__dirname, "views/menu.html"));


});

app.get('/sales', function(req, res) {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);


		res.render(path.join(__dirname, "views/sales.handlebars"), {});
		db.close();
	});
});

app.get('/cart', function(req, res) {
	console.log("Receiving a cart request!");
  	res.sendFile(path.join(__dirname, "views/cart.html"));
});

app.get('/signup', function(req, res) {
	res.render(path.join(__dirname, '/views/signup.handlebars'), { success: false, user: null });
});

app.get('/about', function(req, res) {
	console.log("Receiving an about request!");
  	res.sendFile(path.join(__dirname, "views/about.html"));
});


app.post('/placeOrder', function(req, res) {
	var numPep = req.body.pep;
	var numChick = req.body.chick;
	var numEvery = req.body.every;
	var date = req.body.date;
	console.log(date);
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);

    	db.collection('orders').insert({ pepperoni: numPep, chicken: numChick, everything: numEvery, date: date });
		db.close();
	});

	res.sendFile(path.join(__dirname, "views/cart.html"));
});

app.post('/signup', function(req, res) {
	var name = req.body.name;
	var pass = req.body.pass;
	var email = req.body.email;
	console.log(req.body.email);
	var user = {name: name, pass: pass, email: email};
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);

		db.collection('users').insertOne(user);
		db.close();
	});
	res.render(path.join(__dirname, '/views/signup.handlebars'), { success: true, user: user });
});

app.post('/sales', function(req, res) {
	var date = req.body.dateSelect;

	console.log(date);
	var results = [];
	var sums = [];
	var pepTotal = 0, chickTotal = 0, everyTotal = 0;
	var pepPrice = 0, chickPrice = 0, everyPrice = 0;
	var pepTotalCost = 0, chickTotalCost = 0, everyTotalCost = 0;
	var prices = [];

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
	
		db.collection('orders').find().toArray(function(err, items) {
			//console.log(JSON.stringify(items));

			items = items.filter(function(item) {
				return date == item.date;
			});

			pepTotal = items
            			.map(function(b) { return parseInt(b.pepperoni); })
            			.reduce(function(p, c) { return parseInt(p) + parseInt(c); });
            chickTotal = items
            			.map(function(b) { return parseInt(b.chicken); })
            			.reduce(function(p, c) { return parseInt(p) + parseInt(c); });
            everyTotal = items
            			.map(function(b) { return parseInt(b.everything); })
            			.reduce(function(p, c) { return parseInt(p) + parseInt(c); });
            
		});
		
		db.collection('pizzas').find({name: "Pepperoni"}, {price: 1, _id: 0}).toArray(function(err, arr) {
			prices.push(arr[0].price);
		});
		db.collection('pizzas').find({name: "Chicken Alfredo"}, {price: 1, _id: 0}).toArray(function(err, arr) {
			prices.push(arr[0].price);
		});
		db.collection('pizzas').find({name: "Everything"}, {price: 1, _id: 0}).toArray(function(err, arr) {
			prices.push(arr[0].price);
		});
		
		console.log(prices);
		//console.log(everyPrice);

		pepTotalCost = parseFloat(pepTotal) * parseFloat(pepPrice);
		chickTotalCost = parseFloat(chickTotal) * parseFloat(chickPrice);
		everyTotalCost = parseFloat(everyTotal) * parseFloat(everyPrice);

		//console.log(pepTotalCost);



		db.close();

		});
		var total = pepTotal + chickTotal+everyTotal;
		var stats = {pepTotal: pepTotal, chickTotal: chickTotal, everyTotal: everyTotal, total: total};

		res.render(path.join(__dirname, '/views/sales.handlebars'), { items: results, date: date});


	});

// app.use(function(req,res,next) {
// 	res.type("text/plain");
// 	res.status(404);
// 	res.send("404-Not found");
// });

// Start Server
var server = http.createServer(app).listen(process.env.PORT||3000);
console.log('Server listening on port ' + server.address().port);

