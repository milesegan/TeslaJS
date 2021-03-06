//=====================================================================
// This sample demonstrates using TeslaJS
//
// https://github.com/mseminatore/TeslaJS
//
// Copyright (c) 2016 Mark Seminatore
//
// Refer to included LICENSE file for usage rights and restrictions
//=====================================================================

var tjs = require('../TeslaJS');
var fs = require('fs');
var colors = require('colors');
var program = require('commander');

//
//
//
program
  .usage('[options] number|standard|storage|range')
  .option('-u, --username [string]', 'username (needed only if token not cached)')
  .option('-p, --password [string]', 'password (needed only if token not cached)')
  .option('-i, --index <n>', 'vehicle index (first car by default)', parseInt)
  .option('-U, --uri [string]', 'URI of test server (e.g. http://127.0.0.1:3000)')
  .parse(process.argv);

//
//
//
function login_cb(result) {
    if (result.error) {
        console.error("Login failed!".red);
        console.warn(JSON.stringify(result.error));
        return;
    }

    var options = { authToken: result.authToken, carIndex: program.index || 0 };
    tjs.vehicles(options, function (vehicle) {
        options.vehicleID = vehicle.id_s;
        sampleMain(options);
    });
}

//
//
//
function sampleMain(options) {
    var amt = program.args[0];

    // handle named values
    if (amt.toLowerCase() == "standard")
        amt = 90;
    else if (amt.toLowerCase() == "range")
        amt = 100;
    else if (amt.toLowerCase() == "storage")
        amt = 50;

    tjs.setChargeLimit(options, amt, function (result) {
        if (result.result) {
            var str = (amt + "%").green;
            console.log("\nCharge limit successfully set to: " + str);
        } else
            console.log(result.reason);
    });
}

//
//
//
var tokenFound = false;

try {
    tokenFound = fs.statSync('.token').isFile();
} catch (e) {
}

if (program.uri) {
    console.log("Setting portal URI to: " + program.uri);
    tjs.setPortalBaseURI(program.uri);
}

if (tokenFound) {
    var token = JSON.parse(fs.readFileSync('.token', 'utf8'));

    if (!token || !program.args[0])
        program.help();

    login_cb({ error: false, authToken: token });
} else {
    // no saved token found, expect username and password on command line
    var username = program.username;
    var password = program.password;

    if (!username || !password || !program.args[0])
        program.help();

    tjs.login(username, password, login_cb);
}
