var ImapQuery = require('../lib');
var account = require('./account');

var imap_query = new ImapQuery(account, [["SUBJECT", "message from SPOT"], ["ALL"]], {debug: 1});

imap_query.check(function(error, updated){
    if (error){throw error;}
    console.log('returned '+imap_query.messages().length+' messages');
});