#!/usr/bin/env node

var Repo = require("../repo.js");
var API = require("../api.js");
var config = require("../config.js");
var fs = require("fs");

var conf = config.loadConfig();

exports.sync = function(options) {
	var widgetName = options.widgetName;
	var env = options.env;
	var comment = options.comment;
	var branch = options.branch;
	if (!conf) {
		console.log("you must first login");
		return;
	}
	var user = conf.user;
	if (!user) {
		console.log("you must first login");
		return;
	}
	if (!widgetName) {
		console.log("you must specify the widget");
		return;
	}
	if (!env) {
		console.log("you must specify the env {alpha|beta|product}");
		return;
	}
	if (!comment) {
		console.log("you must enter the comment");
		return;
	}
	if (!branch) {
		console.log("you must specify a branch");
		return;
	}
	deleteTempDirectory(); 
	var tempDirectory = createTempDirectory();
	var cp = require('child_process');
	console.log("create temp directory: " + tempDirectory);

	var command = 'git clone ' + conf.git + " -b " + branch + " " + tempDirectory;
	console.log(command);

	cp.exec(command, {}, function(err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		if(conf.baseDir){
			tempDirectory=tempDirectory+"/"+conf.baseDir
		}
		commitFromDir(tempDirectory);

		function commitFromDir(baseDir) {

			var api = API.getAPI(env);
			var repo = new Repo(baseDir);
			repo.loadWidget(widgetName, function(widget) {
				if (!widget) {
					console.log("widget not found: " + widgetName);
					return;
				}
				console.log("updoading widget: " + widgetName + "...");
				api.commit(user, widget, comment, function(code) {
					if (code == 200) {
						console.log("updoad success");
					} else {
						console.log("updoad failed");
					}
					console.log("delete temp directory success");
					deleteTempDirectory();
				});

			})
		}
	})


}

function createTempDirectory() {
	var path = config.getWizardHome() + "/temp";
	fs.mkdirSync(path);
	return path;
}

function deleteTempDirectory() {
	var path = config.getWizardHome() + "/temp";
	deleteFolderRecursive(path);
}

var deleteFolderRecursive = function(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file, index) {
			var curPath = path + "/" + file;
			if (fs.statSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};