module.exports = function(globalize) {
    console.log(globalize.formatMessage('intro-1'));
    var relativeTimeFormatter = globalize.relativeTimeFormatter('month');
    var currencyFormatter = globalize.currencyFormatter('USD');
    var numberFormatter = globalize.numberFormatter({minimumFractionDigits: 2});
    var dateFormatter = globalize.dateFormatter({date: "medium"});

    console.log(globalize.formatMessage('message-1', {
        currency: currencyFormatter(69900),
        date: dateFormatter(new Date()),
        number: numberFormatter(12345.6),
        relativeTime: relativeTimeFormatter(-2)
    }));
};
