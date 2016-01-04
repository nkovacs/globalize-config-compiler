var Globalize = require('globalize');
var testJson = require('./test-config.json');
var fs = require('fs');

(function loadCldrData() {
    var data = [
        'cldr-data/supplemental/likelySubtags.json',
        'cldr-data/supplemental/numberingSystems.json',
        'cldr-data/supplemental/timeData.json',
        'cldr-data/supplemental/weekData.json',
        'cldr-data/supplemental/plurals.json',
        'cldr-data/supplemental/ordinals.json',
        'cldr-data/supplemental/currencyData.json'
    ];

    for (var i in data) {
        Globalize.load(require(data[i]));
    }
})();

function createGlobalize(locale) {
    var data = [
        'numbers.json',
        'ca-gregorian.json',
        'timeZoneNames.json',
        'currencies.json',
        'dateFields.json',
        'units.json',
    ];

    for (var i in data) {
        Globalize.load(require('cldr-data/main/' + locale + '/' + data[i]));
    }

    return new Globalize(locale);
}

function readMessages(messagesFilepath, locale, context) {
    messagesFilepath = messagesFilepath.replace('[locale]', locale);
    if (context) {
        messagesFilepath = path.resolve(context, messagesFilepath);
    }
    if (!fs.existsSync(messagesFilepath) || !fs.statSync(messagesFilepath).isFile()) {
      console.warn('Unable to find messages file: `' + messagesFilepath + '`');
      return null;
    }
    return JSON.parse(fs.readFileSync(messagesFilepath));
}

var msg = {};
msg['en'] = readMessages(testJson.messages, 'en');

Globalize.loadMessages(msg);

var globalize = createGlobalize('en');
require('./test-common.js')(globalize);
