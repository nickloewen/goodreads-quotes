#!/usr/bin/env node

const request = require('request-promise-native')
const cheerio = require('cheerio')
const program = require('commander')
const BASE_URL = 'http://www.goodreads.com/quotes/tag/'
// var debug = require('debug')('quotes')

module.exports.getQuotes = function (tag) {
  return new Promise(function (resolve, reject) {
    getPageCount(tag).then(function (pageCount) {
      let promises = []
      for (let i = 1; i <= pageCount; i++) {
        promises.push(getPage(tag, i).then(html => parsePage(html)))
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

function processQuotes (tag) {
  module.exports.getQuotes(tag)
  .then(function (quotes) {
    quotes = [].concat.apply([], quotes)
    process.stdout.write(JSON.stringify(quotes, null, 2))
  })
}

program
  .version('0.0.1')
  .usage('<tag>')
  .description('For a given tag, return a JSON object containing all of the matching Goodreads quotes.')
  .arguments('<tag>')
  .action(tag => processQuotes(tag))
  .parse(process.argv)
