var newsSentiment = require('./news-sentiment');


var keywords = [
    'Bitcoin',
    'Cryptocurrency',
    'Bitcoin Cash',
    'Litecoin',
    'Ethereum',
    'Coinbase'
]

var rssFeeds = [
    'https://www.theverge.com/rss/index.xml',
    'http://feeds.bbci.co.uk/news/technology/rss.xml',
    'http://feeds.reuters.com/reuters/technologyNews',
    'http://feeds.reuters.com/reuters/UKBankingFinancial',
    'http://feeds.skynews.com/feeds/rss/technology.xml',
    'http://feeds.skynews.com/feeds/rss/business.xml',
    'https://news.bitcoin.com/feed/'


]

newsSentiment.parseFeeds(rssFeeds, keywords)