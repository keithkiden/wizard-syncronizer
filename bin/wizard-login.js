var Repo = require("../repo.js");
var API = require("../api.js");
var config = require("../config.js");

var conf = config.loadConfig();


var apiPool = {
	alpha: new API("alpha.wizard.dp"),
	beta: new API("beta.wizard.dp"),
	product: new API("wizard.dp")
}


exports.login = function(options) {
	var env = options.env;
	var name = options.username;
	var password = options.password;
	if (!env) {
		console.log("you must specify the env {alpha|beta|product}");
		return;
	}
	if (!name || !password) {
		console.log("name or password cannot be null");
		return;
	}
	var api = apiPool[env];
	console.log("login...")
	api.login(name, password, function(user) {
		if (user) {
			conf.user = user
			config.saveConfig(conf);
			console.log("login success");
		} else {
			console.log("login failed");
		}
	});
}