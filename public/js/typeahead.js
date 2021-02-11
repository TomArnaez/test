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

var courses = ["IT 102 PROGRAMMING FUNDAMENTALS", "IT 114 CompTIA A+ PREP", "IT 131 NETWORKING FUNDAMENTALS", "IT 135 CompTIA SECURITY+ PREP", "IT 141 CS & WORK ENV FOR IT PRO", "IT 160 WINDOWS SERVER ADMIN I", "IT 175 STUDENT ASSISTANT", "IT 178 IT WORK EXPERIENCE", "IT 190 LINUX ADMINISTRATION I", "IT 201 DATABASE FUNDAMENTALS", "IT 206 FRONT-END WEB DEV", "IT 210 INTRO ROUTING/SWITCHING", "IT 219 PROGRAMMING I", "IT 240 WINDOWS SERVER ADMIN II", "IT 243 LINUX ADMINISTRATION II", "IT 340 NETWORK SEC & FIREWALLS", "IT 360 FORENSICS/VULNERABILITY", "IT 460 THREAT ANALYSIS", "IT 426 DESIGN PATTERNS/PRACTICE", "IT 410 DESIGN/SUPPORT NETWORKS", "IT 405 MOBILE DEV FRAMEWORKS", "IT 390 MOBILE DEV/WIRELESS NET", "IT 372 SOFTWARE MAINTENANCE", "IT 355 AGILE DEV METHODS", "IT 344 VIRTUALIZATION & STORAGE", "IT 305 WEB DEV FRAMEWORKS", "IT 301 SYSTEMS PROGRAMMING"];

// Suggestion engine
var courses = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: courses
});

$('#courses').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
}, {
    name: 'courses',
    source: courses,
});