Globalize-config-compiler is a wrapper around globalize-compiler. It allows you to
specify the formatters and parsers you wish to use in a json config file, and
will feed that to globalize-compiler.

## Why?

Globalize-compiler attempts to find formatters and parsers inside your javascript code.
It's pretty limited, and if you try to use something advanced, such as an angular filter,
it won't be able to find them. Globalize-config-compiler allows you to skip the extraction
part, and manually specify the formatters and parsers in a config file.

You can also write your own extractor, and feed it to globalize-config-compiler.

Check out the `example` directory for an example config file and usage. To compile the
formatters and parsers, run `node index.js` inside the example directory, then run `test-generated.js` to test the generated file.
