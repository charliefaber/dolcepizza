// this array will be populated from nodeJS
let pizzas = [
	{name:"Pepperoni",img:"pepperoni.jpg",price:8.99},
	{name:"Chicken Alfredo",img:"alfredo.jpg",price:9.99},
	{name:"Everything",img:"everything.jpg",price:10.99}
];

function registerButtonEvents() {
	let buttons = document.getElementsByTagName("button");
	for(let i=0; i<buttons.length; i++) {
		buttons[i].addEventListener("click", function() {
			addToCart(i);
		});
	}
	let number= localStorage.getItem("number");
	if (number===null)
		number=0;
	document.getElementById("numItem").innerHTML=number;
}

function addToCart(pID) {
	let cartJ = localStorage.getItem("cart");
	let cart;

	if(cartJ === null) 
		cart = [];
	else 
		cart = cartJ.split(",");
	
	cart.push(pID);
	let number = localStorage.getItem("number");
	if(number === null)
		number = 0;
	document.getElementById("numItem").innerHTML = (`${++number}`);
	localStorage.setItem("cart", cart.toString());
	localStorage.setItem("number", number);
}

function clearCart() {
	localStorage.removeItem("cart");
	localStorage.removeItem("number");
	number=0;
	document.getElementById("numItem").innerHTML=`${number}`;
	showCart();
}

function showCart() {
	let number= localStorage.getItem("number");
	if (number===null)
		number=0;
	document.getElementById("numItem").innerHTML=number;
	let cartJ = localStorage.getItem("cart");
	let cart = [];
	let info = "";
	if(cartJ === null)
		document.getElementById("myCart").innerHTML = "<h2>You have no items in the cart!</h2>";
	else {
		cart = cartJ.split(",");
		for(let i of cart) {
			let item = pizzas[i];
			info += 
			`<div class="row">
				<div class="col-md-3 text-center">
					<h3>${item.name}</h3>
				</div>
				<div class="col-md-3 text-center">
					<img class="pizza" src="./images/${item.img}" alt="pepperoni">
				</div>
				<div class="col-md-3 text-center">
					<br><br><br>
					<button type="button" class="btn-danger btn-lg" onclick="removePizza(${i})">Remove</button>
				</div>
				<div class="col-md-3 text-center">
					<h3>${item.price}</h3>
				</div>
			</div>
			<br>`;
		}
		document.getElementById("myCart").innerHTML=info;
	}
}


function removePizza(i) {
	let cartJ=localStorage.getItem("cart");
	let cart = cartJ.split(",");
	let index = cart.indexOf(i.toString());
	cart.splice(index,1);
	if(cart.length===0) {
		localStorage.removeItem("cart");
	}
	else {
		localStorage.setItem("cart", cart.toString());
	}
	let num = localStorage.getItem("number")-1;
	localStorage.setItem("number", num.toString());
	showCart();
}
function post(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
         }
    }

    document.body.appendChild(form);
    form.submit();

}


function placeOrder() {
	let cartJ = localStorage.getItem("cart");
	let cart = [];
	let info = "";
	if(cartJ === null)
		console.log("No items in cart to order!");
	else {
		cart = cartJ.split(",");
		var numPep = 0, numChick = 0; numEvery = 0;
		for(var i = 0; i<cart.length; i++) {
			if(cart[i]==0) 
				numPep++;
			else if(cart[i]==1)
				numChick++;
			else if(cart[i]==2)
				numEvery++;
		}
		var today = new Date();
		var date = today.toISOString().substring(0, 10);

  		//var date = today.getFullYear()+'-'+(today.getMonth())+'-'+today.getDate();

		var order = {pep: numPep, chick: numChick, every: numEvery, date: date};
		post("/placeOrder", order);
		clearCart();

	}


}


