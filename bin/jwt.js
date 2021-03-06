#! /usr/bin/env node

var colors = require('colors');
var json = require('format-json');
var jwt = require('jsonwebtoken');

function niceDate(unixTimestamp) {
    var date = new Date(unixTimestamp * 1000);
    return colors.yellow(unixTimestamp) + " " + date.toLocaleString();
}

function processToken(token) {
    if (token.string === undefined || token.string.split('.').length !== 3) {
        console.log('jwt-cli - JSON Web Token parser [version 1.1.0]\n');
        console.info(colors.yellow('Usage: jwt <encoded token>\n'));
        console.log('ℹ Documentation: https://www.npmjs.com/package/jwt-cli');
        console.log('⚠ Issue tracker: https://github.com/troyharvey/jwt-cli/issues');
        return;
    }

    token.parts = token.string.split('.');
    token.decoded = jwt.decode(token.string, {complete: true});

    if (token.decoded === null) {
        console.log('\n😾  token no good');
        return;
    }

    console.log(
        '\n' +
        colors.magenta('http://jwt.io/#id_token=') +
        colors.cyan(token.parts[0]) + '.' +
        colors.yellow(token.parts[1]) + '.' +
        colors.magenta(token.parts[2])
    );

    console.log(colors.cyan('\n✻ Header'));
    console.log(colors.cyan(json.plain(token.decoded.header)));

    console.log(colors.yellow('\n✻ Payload'));
    console.log(colors.yellow(json.plain(token.decoded.payload)));

    console.log(colors.yellow('   iat: ') + niceDate(token.decoded.payload.iat));
    console.log(colors.yellow('   nbf: ') + niceDate(token.decoded.payload.nbf));
    console.log(colors.yellow('   exp: ') + niceDate(token.decoded.payload.exp));

    console.log(colors.magenta('\n✻ Signature ' + token.decoded.signature));
}

var token = {};

if (process.stdin.isTTY) {
    token['string'] = process.argv[2];
    processToken(token);
}
else {
    var data = '';
    process.stdin.on('readable', function() {
      var chunk;
      while (chunk = process.stdin.read()) {
          data += chunk;
      }
    });

    process.stdin.on('end', function () {
        // There will be a trailing \n from the user hitting enter. Get rid of it.
        data = data.replace(/\n$/, '');
        token['string'] = data;
        processToken(token);
    });
}
