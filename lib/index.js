var globalizeCompiler = require('globalize-compiler');
var Globalize = require('globalize');
var fs = require('fs');
var path = require('path');

function loadGlobalData() {
    var data = [
        'cldr-data/supplemental/likelySubtags.json',
        'cldr-data/supplemental/numberingSystems.json',
        'cldr-data/supplemental/timeData.json',
        'cldr-data/supplemental/weekData.json',
        'cldr-data/supplemental/plurals.json',
        'cldr-data/supplemental/ordinals.json',
        'cldr-data/supplemental/currencyData.json'
    ];

    var loaded = [];
    for (var i in data) {
        loaded.push(require(data[i]));
    }

    return loaded;
};

function loadLocaleData(locale) {
    var data = [
        'numbers.json',
        'ca-gregorian.json',
        'timeZoneNames.json',
        'currencies.json',
        'dateFields.json',
        'units.json'
    ];

    var loaded = [];
    for (var i in data) {
        loaded.push(require('cldr-data/main/' + locale + '/' + data[i]));
    }

    return loaded;
}

function readMessages(messagesFilepath, locale, context, dependentFileCallback) {
    messagesFilepath = messagesFilepath.replace('[locale]', locale);
    if (context) {
        messagesFilepath = path.resolve(context, messagesFilepath);
    }
    if (!fs.existsSync(messagesFilepath) || !fs.statSync(messagesFilepath).isFile()) {
      console.warn('Unable to find messages file: `' + messagesFilepath + '`');
      return null;
    }
    if (dependentFileCallback !== null) {
        dependentFileCallback(messagesFilepath);
    }
    return JSON.parse(fs.readFileSync(messagesFilepath));
}

/**
 * config: configuration
 * options:
 *  - loadGlobalData: global cldr data loader function
 *  - loadLocaleData: locale cldr data loader function
 *  - context: directory, message files are relative to this
 *  - compilerOptions: options to pass to globalize compiler
 *  - dependentFile: a callback that will be called for each file that the compilation depends on
 */
function compile(config, options) {
    options = options || {};
    var globalDataLoader = options.loadGlobalData || loadGlobalData;
    var localeDataLoader = options.loadLocaleData || loadLocaleData;
    var compilerOptions = options.compilerOptions || {};
    var dependentFile = typeof options.dependentFile === 'function' ? options.dependentFile : null;


    function loadIntoGlobalize(data) {
        Globalize.load.apply(null, data);
    }

    function createGlobalize(locale) {
        loadIntoGlobalize(localeDataLoader(locale));

        return new Globalize(locale);
    }

    loadIntoGlobalize(globalDataLoader());

    var messages;

    var globalize;
    var locale;
    var formattersAndParsers;
    var messageFilePath;
    var messageWrapper;
    var out = {};
    for (var i in config.availableLocales) {
        locale = config.availableLocales[i];
        globalize = createGlobalize(locale);

        formattersAndParsers = [];
        if (config.messages) {
            messages = readMessages(config.messages, locale, options.context, dependentFile);
            if (messages) {
                messageWrapper = {};
                messageWrapper[locale] = messages;
                Globalize.loadMessages(messageWrapper);
                for (var msgId in messages) {
                    formattersAndParsers.push(globalize.messageFormatter(msgId));
                }
            }
        }

        if (config.dateFormatters) {
            for (var i in config.dateFormatters) {

                formattersAndParsers.push(globalize.dateFormatter(config.dateFormatters[i] || undefined));
            }
        }

        if (config.dateParsers) {
            for (var i in config.dateParsers) {
                formattersAndParsers.push(globalize.dateParser(config.dateParsers[i] || undefined));
            }
        }

        if (config.numberFormatters) {
            for (var i in config.numberFormatters) {
                formattersAndParsers.push(globalize.numberFormatter(config.numberFormatters[i] || undefined));
            }
        }

        if (config.numberParsers) {
            for (var i in config.numberParsers) {
                formattersAndParsers.push(globalize.numberParser(config.numberParsers[i] || undefined));
            }
        }

        if (config.currencyFormatters) {
            for (var i in config.currencyFormatters) {
                var formatterConfig = config.currencyFormatters[i];
                if (!Array.isArray(formatterConfig)) {
                    formatterConfig = [formatterConfig];
                }
                var formatterOptions = formatterConfig[1] || undefined;
                var currency = formatterConfig[0];

                formattersAndParsers.push(globalize.currencyFormatter(currency, formatterOptions));
            }
        }

        if (config.pluralGenerators) {
            for (var i in config.pluralGenerators) {
                formattersAndParsers.push(globalize.pluralGenerator(config.pluralGenerators[i] || undefined));
            }
        }

        if (config.relativeTimeFormatters) {
            for (var i in config.relativeTimeFormatters) {
                var formatterConfig = config.relativeTimeFormatters[i];
                if (!Array.isArray(formatterConfig)) {
                    formatterConfig = [formatterConfig];
                }
                var formatterOptions = formatterConfig[1] || undefined;
                var unit = formatterConfig[0];

                formattersAndParsers.push(globalize.relativeTimeFormatter(unit, formatterOptions));
            }
        }

        if (config.unitFormatters) {
            for (var i in config.unitFormatters) {
                var formatterConfig = config.unitFormatters[i];
                if (!Array.isArray(formatterConfig)) {
                    formatterConfig = [formatterConfig];
                }
                var formatterOptions = formatterConfig[1] || undefined;
                var unit = formatterConfig[0];

                formattersAndParsers.push(globalize.unitFormatter(unit, formatterOptions));
            }
        }

        out[locale] = globalizeCompiler.compile(formattersAndParsers, compilerOptions);
    }

    return out;
}

module.exports = compile;
