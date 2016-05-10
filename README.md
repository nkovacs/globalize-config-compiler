Globalize-config-compiler is a wrapper around [globalize-compiler](https://github.com/jquery-support/globalize-compiler). It allows you to
specify the formatters and parsers you wish to use as a plain old javascript object, and
will feed that to globalize-compiler.

It is primarily meant to be used with [globalize-config-loader](https://github.com/nkovacs/globalize-config-loader) and webpack.

## Why?

Globalize-compiler attempts to find formatters and parsers inside your javascript code.
It's pretty limited, and if you try to use something advanced, such as an angular filter,
it won't be able to find them. Globalize-config-compiler allows you to skip the extraction
part and manually specify the formatters and parsers.

You can also write your own extractor and feed it to globalize-config-compiler.

Check out the `example` directory for an example config file and usage. To compile the
formatters and parsers, run `node index.js` inside the example directory, then run `test-generated.js` to test the generated file.

## Usage

```js
var compiler = require('globalize-config-compiler');

var config = {...};

var result = compiler(config, {
  context: context,
  compilerOptions: {
    template: template
  },
  dependentFile: addDependency
});
```

The second parameter of compiler is an options object with the following properties:

*  `loadGlobalData`: global cldr data loader function.
*  `loadLocaleData`: locale cldr data loader function
*  `context`: directory, message files are relative to this
*  `compilerOptions`: options to pass to globalize compiler
*  `dependentFile`: a callback that will be called for each file that the compilation depends on (currently only message files)

All are optional.
The default `loadGlobalData` function will `require` the following cldr-data modules:

* cldr-data/supplemental/likelySubtags.json
* cldr-data/supplemental/numberingSystems.json
* cldr-data/supplemental/timeData.json
* cldr-data/supplemental/weekData.json
* cldr-data/supplemental/plurals.json
* cldr-data/supplemental/ordinals.json
* cldr-data/supplemental/currencyData.json

The default `loadLocaleData` function will `require` the following cldr-data modules for each locale:

* cldr-data/main/[locale]/numbers.json
* cldr-data/main/[locale]/ca-gregorian.json
* cldr-data/main/[locale]/timeZoneNames.json
* cldr-data/main/[locale]/currencies.json
* cldr-data/main/[locale]/dateFields.json
* cldr-data/main/[locale]/units.json

## Config object structure

* `availableLocales`: an array of locales to use.
* `messages`: path to message file, `[locale]` will be replaced by the locale. A message formatter will be created for each message using [messageFormatter](https://github.com/jquery/globalize#message-module). The path is relative to the `context` option passed to the compiler.
* `dateFormatters`: array of date formatter options. Each element will be passed to the [dateFormatter](https://github.com/jquery/globalize#date-module) function to create a date formatter. Use null to call the function without the options parameter.
* `dateParsers`: array of date parser options. Each element will be passed to the [dateParser](https://github.com/jquery/globalize#date-module) function to create a date parser. Use null to call the function without the options parameter.
* `numberFormatters`: array of number formatter options. Each element will be passed to the [numberFormatter](https://github.com/jquery/globalize#number-module) function to create a number formatter. Use null to call the function without the options parameter.
* `numberParsers`: array of number parser options. Each element will be passed to the [numberParser](https://github.com/jquery/globalize#number-module) function to create a number parser. Use null to call the function without the options parameter.
* `pluralGenerators`: array of plural generator options. Each element will be passed to the [pluralGenerator](https://github.com/jquery/globalize#plural-module) function to create a plural generator. Use null to call the function without the options parameter.
* `currencyFormatters`: array of currency formatter parameters. The elemens may either be strings or arrays; in the latter case the first element of the array must be a string. The array may contain a second element, an options object. The string and the options object, if provided, will be passed to the [currencyFormatter](https://github.com/jquery/globalize#currency-module) function to create a currency formatter.
* `relativeTimeFormatters`: array of relative time formatter parameters. The elemens may either be strings or arrays; in the latter case the first element of the array must be a string. The array may contain a second element, an options object. The string and the options object, if provided, will be passed to the [relativeTimeFormatter](https://github.com/jquery/globalize#relative-time-module) function to create a relative time formatter.
* `unitFormatters`: array of unit formatter parameters. The elemens may either be strings or arrays; in the latter case the first element of the array must be a string. The array may contain a second element, an options object. The string and the options object, if provided, will be passed to the [unitFormatter](https://github.com/jquery/globalize#unit-module) function to create a unit formatter.

The parser and formatters generated from these options are passed to globalize-compiler to generate a compiled module for each locale. The result is returned as an object with the locales as keys.
