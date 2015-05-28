var ImapQuery = require('../lib');
var config = require('./config');

var imap_query = new ImapQuery(config, [["SUBJECT", "message from SPOT"], ["ALL"]]);

imap_query.check(function(error, updated){
    if (error){throw error;}
    console.log('found '+imap_query.messages().length+' messages');
});