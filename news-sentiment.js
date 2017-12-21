var parser = require('rss-parser');
var sentiment1 = require('sentiment');
var sentiment2 = require('sentiment-analysis');
var q = require('q');
var scraperjs = require('scraperjs');
var removeNewline = require('newline-remove');

process.on('uncaughtException', function(err) {
    console.log(err);
})

module.exports = {

    parseFeeds: function(rssFeeds, keywords) {
        console.log('Checking ' + rssFeeds.length + ' RSS Feeds');
        console.log('-------------------')
        var matchingEntries = [];
        var promises = [];
        for (var i = 0; i < rssFeeds.length; i++) {
            promises.push(parseUrl(rssFeeds[i], keywords))
        }

        q.allSettled(promises).then(function(results) {
            console.log('-------------------')
            var matchingEntries = [];
            for (i = 0; i < results.length; i++) {
                matchingEntries = matchingEntries.concat(results[i].value)
            }
            console.log('Found ' + matchingEntries.length + ' relevant articles');
            console.log('-------------------')
            for (j = 0; j < matchingEntries.length; j++) {
                console.log('SENTIMENT 1: ' + sentiment1(matchingEntries[j].content).score + ' -- SENTIMENT 2: ' + sentiment2(matchingEntries[j].content) + ' -- ' + matchingEntries[j].title + ' -- ' + matchingEntries[j].link);
            }
        })
    },
    scrapeNews: function(webNews) {
        var promises = [];
        for (var i = 0; i < webNews.length; i++) {
            promises.push(scrapeData(webNews[i].linkListUrl, webNews[i].linkListUrlMarker, 'href'));
        };
        q.allSettled(promises).then(function(results) {
            var articleURLs = [];
            for (var i = 0; i < results.length; i++) {
                for (j = 0; j < results[i].value.content.length; j++) {
                    articleURLs = articleURLs.concat({ articleURL: results[i].value.content[j], parentURL: results[i].value.parentURL })
                }
            }

            articleURLs = filterRequiredURLStrings(webNews, articleURLs);

            var promises = [];
            for (var i = 0; i < articleURLs.length; i++) {
                var deferred = q.defer();
                scrapeData(articleURLs[i].articleURL, getParentURLContentMarker(webNews, articleURLs[i].parentURL), 'text').then(function(data) {
                    var contentConcat = "";
                    for (var j = 0; j < data.content.length; j++) {
                        contentConcat = contentConcat + removeNewline(data.content[j]);
                    }
                    deferred.resolve({ parentURL: data.parentURL, content: contentConcat })
                });
                promises.push(deferred.promise);
            }
            //console.log(promises)
            q.allSettled(promises).then(function(results) {
                for (var i = 0; i < results.length; i++) {
                    console.log(results[i].value)
                }
            })
        });
    }
}

var getParentURLContentMarker = function(webNews, parentURL) {
    for (var i = 0; i < webNews.length; i++) {
        if (webNews[i].linkListUrl == parentURL)
            return webNews[i].articleContentMarker;
    }
    return undefined;
}
var filterRequiredURLStrings = function(webNews, articleURLs) {
    var filteredArticleURLs = [];
    try {
        console.log(articleURLs)
        for (var i = 0; i < articleURLs.length; i++) {
            console.log('xxxxxx')
            console.log(articleURLs[i])
            for (var j = 0; j < webNews.length; j++) {
                if (webNews[j].linkListUrl == articleURLs[i].parentURL) {
                    if (articleURLs[i].articleURL.indexOf(webNews[j].requiredURLString) != -1) {
                        filteredArticleURLs.push(articleURLs[i]);
                    }
                }
            }

            console.log(filteredArticleURLs)
            return filteredArticleURLs;
        }
    } catch (err) {
        console.log(err);
    }
}

var parseUrl = function(rssFeed, keywords) {
    var deferred = q.defer();
    parser.parseURL(rssFeed, function(err, parsed) {
        console.log('Checking: ' + parsed.feed.title);
        var matchingEntries = [];
        for (var j = 0; j < parsed.feed.entries.length; j++) {
            matchingEntries = matchingEntries.concat(keywordMatcher(parsed.feed.entries[j], keywords));
        }
        deferred.resolve(matchingEntries);
    })
    return deferred.promise;
}

var removeDuplicateObjects = function removeDuplicates(array, property) {
    return array.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[property]).indexOf(obj[property]) === pos;
    });
}

var keywordMatcher = function(entry, keywords) {
    var title = entry.title.toLowerCase();
    var content = entry.content.toLowerCase();
    var matchingEntries = []

    keywords.forEach(function(keyword) {
        if (title.indexOf(keyword.toLowerCase()) != -1 || content.indexOf(keyword.toLowerCase()) != -1)
            matchingEntries.push(entry)
    });

    matchingEntries = removeDuplicateObjects(matchingEntries, 'title')
    return removeDuplicateObjects(matchingEntries, 'title');
};

var scrapeData = function(url, marker, contentType) {
    var deferred = q.defer();
    try {
        var scraperjs = require('scraperjs');
        scraperjs.StaticScraper.create(url)
            .scrape(function($) {
                return $(marker).map(function() {
                    switch (contentType) {
                        case 'text':
                            return $(this).text();
                            break;
                        case 'href':
                            return $(this).attr('href');
                            break;
                    }
                }).get();
            })
            .then(function(content) {
                deferred.resolve({
                    content: content,
                    parentURL: url
                });
            })
    } catch (err) {
        console.log(err)
    }
    return deferred.promise;
}

//scrapeData('http://www.bbc.co.uk/news/world-asia-india-42390013', '.story-body__inner', 'text')