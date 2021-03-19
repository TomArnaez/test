var express = require('express');
var router = express.Router();

const maybePluralize = (count, noun, suffix = 's') =>
    `${count} ${noun}${count !== 1 ? suffix : ''}`

/* GET search results. */
router.get('/', function(req, res, next) {

    const http = require('http')
    const title = req.query.q;
    const page = req.query.page;

    http.get("http://localhost:3000/api/posts?page=" + page + "&size=3&title=" + title, (resp) => {
        let data = ""

        resp.on("data", d => {
            data += d
        })
        resp.on("end", () => {
            let json = JSON.parse(data);
            const resultsString = "" +  maybePluralize(json.totalItems, "result") + ' for query: "' + title + '"';
            const obj = {search: true, searchQuery: title, resultsString: resultsString, results: json.posts,
                page_number: parseInt(json.currentPage + 1), total_pages: json.totalPages, count: json.totalItems,
                next_page: "search?q=" + title + "&page=" + (parseInt(page) + 1),
                prev_page: "search?q=" + title + "&page=" + (parseInt(page) - 1)};
            res.render('search_results', obj);
        })
    });
});

module.exports = router;
