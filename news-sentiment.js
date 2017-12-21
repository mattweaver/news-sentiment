var parser = require('rss-parser');
var sentiment = require('sentiment');
var q = require('q');

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
                console.log('SENTIMENT: ' + sentiment(matchingEntries[j].content).score + ' -- ' + matchingEntries[j].title + ' -- ' + matchingEntries[j].link);
            }
        })

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