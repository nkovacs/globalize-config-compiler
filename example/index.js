var fs = require('fs');
var compile = require('../');

var configFile = 'test-config.json';

if (!fs.existsSync(configFile) || !fs.statSync(configFile).isFile()) {
  console.warn("Unable to find config file: `" + configFile + "`");
  return;
}

var config = JSON.parse(fs.readFileSync(configFile));

var compiled = compile(config);

for (var locale in compiled) {
    fs.writeFileSync('build/' + locale + '.build.js', compiled[locale].replace(/return Globalize;/, "return new Globalize(\"" + locale + "\");"));
}
