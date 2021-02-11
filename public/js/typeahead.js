var substringMatcher = function(strings) {
    return function findMatches(q, cb) {
        var matches, substringRegex;

        // an array that will be populated with substring matches
        matches = [];

        // regex used to determine if a string contains the substring `q`
        substrRegex = new RegExp(q, 'i');

        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        $.each(strings, function(i, string) {
            if (substrRegex.test(string)) {
                matches.push(string);
            }
        });

        cb(matches);
    };
};

$('#courses').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
}, {
    name: 'courses',
    source: courses,
});