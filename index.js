const request = require('request-promise-native')
const cheerio = require('cheerio')
const BASE_URL = 'http://www.goodreads.com/quotes/tag/'
// var debug = require('debug')('quotes')

function getQuotes (tag) {
  return new Promise(function (resolve, reject) {
    getPageCount(tag).then(function (pageCount) {
      let promises = []
      for (let i = 1; i <= pageCount; i++) {
        promises.push(getPage(tag, pageCount).then(html => parsePage(html)))
      }
      resolve(Promise.all(promises))
    })
  })
}

function parsePage (html) {
  let $ = cheerio.load(html)
  let json = []

  $('.quoteDetails').each(function (i, obj) {
    let quote = {
      text: $('.quoteText', $(this)).contents().get(0).nodeValue.trim(),
      author: $('.authorOrTitle', $(this)).html()
    }

    if (quote.text.charAt(quote.text.length - 1) === '”') {
      json.push(quote)
    }
  })

  return json
}

function getPageCount (tag) {
  return new Promise(function (resolve, reject) {
    request(BASE_URL + tag, function (err, res, body) {
      if (err) { reject(err) }

      let $ = cheerio.load(body)
      let totalPages = $('.next_page').prev().html()
      if (!$('.next_page').length) totalPages = 1

      resolve(totalPages)
    })
  })
}

function getPage (tag, pageNumber) {
  return new Promise(function (resolve, reject) {
    request(BASE_URL + tag + '?page=' + pageNumber, (err, res, body) => {
      if (err) { reject(err) }
      resolve(body)
    })
  })
}

getQuotes('brainy')
.then(function (quotes) {
  quotes = [].concat.apply([], quotes)
  process.stdout.write(JSON.stringify(quotes, null, 2))
})
