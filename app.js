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
    'https://www.theverge.com/tech/rss/index.xml',
    'http://feeds.bbci.co.uk/news/technology/rss.xml',
    'http://feeds.reuters.com/reuters/technologyNews',
    'http://feeds.reuters.com/reuters/UKBankingFinancial',
    'http://feeds.skynews.com/feeds/rss/technology.xml',
    'http://feeds.skynews.com/feeds/rss/business.xml',
    'https://news.bitcoin.com/feed/'
]

var webNews = [{
    linkListUrl: 'https://www.theverge.com/search?q=cryptocurrency+bitcoin+litecoin+ethereum',
    linkListUrlMarker: '.c-entry-box--compact__title a',
    articleContentMarker: '. l-col__main .c-entry-content',
    requiredURLString: ''
}, {
    linkListUrl: 'https://www.bbc.co.uk/search?q=cryptocurrency',
    linkListUrlMarker: '.search-results h1 a',
    articleContentMarker: '.story-body__inner',
    requiredURLString: 'www.bbc.co.uk/news'
}]


//newsSentiment.parseFeeds(rssFeeds, keywords)
newsSentiment.scrapeNews(webNews)