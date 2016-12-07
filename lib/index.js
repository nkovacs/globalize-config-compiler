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
}

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

function extractMessageIds(messages, prefix) {
    if (typeof prefix === 'undefined') {
        prefix = '';
    }
    var msgIds = [];
    var message;
    for (var msgId in messages) {
        message = messages[msgId];
        if (typeof message === 'object' && !Array.isArray(message)) {
            msgIds = msgIds.concat(extractMessageIds(message, prefix + msgId + '/'));
        } else {
            msgIds.push(prefix + msgId);
        }
    }
    return msgIds;
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
    var messageWrapper;
    var out = {};
    var msgIds;
    var i, l;
    var formatterConfig, formatterOptions;
    var unit, currency;
    for (var localeId in config.availableLocales) {
        locale = config.availableLocales[localeId];
        globalize = createGlobalize(locale);

        formattersAndParsers = [];
        if (config.messages) {
            messages = readMessages(config.messages, locale, options.context, dependentFile);
            if (messages) {
                messageWrapper = {};
                messageWrapper[locale] = messages;
                Globalize.loadMessages(messageWrapper);
                msgIds = extractMessageIds(messages);
                for (i = 0, l = msgIds.length; i < l; i++) {
                    formattersAndParsers.push(globalize.messageFormatter(msgIds[i]));
                }
            }
        }

        if (config.dateFormatters) {
            for (i in config.dateFormatters) {
                formattersAndParsers.push(globalize.dateFormatter(config.dateFormatters[i] || undefined));
            }
        }

        if (config.dateParsers) {
            for (i in config.dateParsers) {
                formattersAndParsers.push(globalize.dateParser(config.dateParsers[i] || undefined));
            }
        }

        if (config.numberFormatters) {
            for (i in config.numberFormatters) {
                formattersAndParsers.push(globalize.numberFormatter(config.numberFormatters[i] || undefined));
            }
        }

        if (config.numberParsers) {
            for (i in config.numberParsers) {
                formattersAndParsers.push(globalize.numberParser(config.numberParsers[i] || undefined));
            }
        }

        if (config.currencyFormatters) {
            for (i in config.currencyFormatters) {
                formatterConfig = config.currencyFormatters[i];
                if (!Array.isArray(formatterConfig)) {
                    formatterConfig = [formatterConfig];
                }
                formatterOptions = formatterConfig[1] || undefined;
                currency = formatterConfig[0];

                formattersAndParsers.push(globalize.currencyFormatter(currency, formatterOptions));
            }
        }

        if (config.pluralGenerators) {
            for (i in config.pluralGenerators) {
                formattersAndParsers.push(globalize.pluralGenerator(config.pluralGenerators[i] || undefined));
            }
        }

        if (config.relativeTimeFormatters) {
            for (i in config.relativeTimeFormatters) {
                formatterConfig = config.relativeTimeFormatters[i];
                if (!Array.isArray(formatterConfig)) {
                    formatterConfig = [formatterConfig];
                }
                formatterOptions = formatterConfig[1] || undefined;
                unit = formatterConfig[0];

                formattersAndParsers.push(globalize.relativeTimeFormatter(unit, formatterOptions));
            }
        }

        if (config.unitFormatters) {
            for (i in config.unitFormatters) {
                formatterConfig = config.unitFormatters[i];
                if (!Array.isArray(formatterConfig)) {
                    formatterConfig = [formatterConfig];
                }
                formatterOptions = formatterConfig[1] || undefined;
                unit = formatterConfig[0];

                formattersAndParsers.push(globalize.unitFormatter(unit, formatterOptions));
            }
        }

        out[locale] = globalizeCompiler.compile(formattersAndParsers, compilerOptions);
    }

    return out;
}

module.exports = compile;
