var request = require('request');
var cheerio = require('cheerio');

exports.getQuotes = function (tag, config_max_pages=0) {
	return new Promise((resolve, reject) => {
		request("http://www.goodreads.com/quotes/tag/" + tag, (err, res, body) => {
			if (err) { reject(err); return; }
			resolve(body);
		});
	})
	.then(html => {
		let $ = cheerio.load(html);

		let totalPages = $(".next_page").prev().html(); // default: get all the pages
		let lastPage = totalPages;
		if (config_max_pages != 0) { // user # of pages: get at most that many pages
			lastPage = Math.min(config_max_pages, totalPages);
		}

		if (!$(".next_page").length) {
			// there's only one page
			totalPages = 1;
		}

		let promises = []

		for (let i = 1; i <= totalPages; i++) {
			promises.push(new Promise((resolve, reject) => {
				request("http://www.goodreads.com/quotes/tag/" + tag + "?page=" + i, (err, res, body) => {
					if (err) { reject(err); return; }
					resolve(parsePage(body));
				});
			}));
		}
		return Promise.all(promises);
	})
	.catch(err => console.log(err));
}

parsePage = function(html) {
	let $ = cheerio.load(html);
	let json = [];

	$('.quoteDetails').each(function(i, obj) {
		let quote = {
			text: $('.quoteText', $(this)).contents().get(0).nodeValue.trim(),
			authorOrTitle: $('.authorOrTitle', $(this)).html()
		}

		if (quote.text.charAt(quote.text.length - 1) == '”') {
			json.push(quote);
		}
	});

	return json;
}
